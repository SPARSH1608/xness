require('dotenv').config()
const prisma = require('./prismaClient');
const redis = require('./redisClient');
const { Kafka } = require('kafkajs');
const cron = require('node-cron');
const { Server } = require('socket.io')
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const kafkaClient = new Kafka({
  clientId: 'positions',
  brokers: ["localhost:9092"],
});
const kafkaProducer = kafkaClient.producer();
kafkaProducer.connect().catch(console.error);

const kafkaConsumer = kafkaClient.consumer({ groupId: 'liquidation-group' });

let openPositionIds = new Set();

async function initKafkaConsumer() {
  await kafkaConsumer.connect();
  await kafkaConsumer.subscribe({ topic: 'open-positions', fromBeginning: true });

  await kafkaConsumer.run({
    eachMessage: async ({ message }) => {
      try {
        if (!message.value) {
          // Tombstone message: remove from set
          if (message.key) {
            openPositionIds.delete(Number(message.key.toString()));
          }
          return;
        }
        const { positionId } = JSON.parse(message.value.toString());
        openPositionIds.add(Number(positionId));
      } catch (err) {
        console.error('Failed to parse Kafka message:', err);
      }
    },
  });
}

async function checkAndLiquidatePositions() {
  for (const id of Array.from(openPositionIds)) {
    const pos = await prisma.position.findUnique({ where: { positionId: id } });
    if (!pos || pos.status !== "open") {
      openPositionIds.delete(id);
      continue;
    }
    console.log(`Checking position ${id} for liquidation...`, pos);
    const priceStr = await redis.get(`price:${pos.asset}`);
    if (!priceStr) continue;
    const currentPrice = parseFloat(priceStr);

    let pnl;
    if (pos.type === "long") {
      pnl = (currentPrice - Number(pos.boughtPrice)) * Number(pos.quantity);
    } else {
      pnl = (Number(pos.boughtPrice) - currentPrice) * Number(pos.quantity);
    }
    console.log('pnl', pnl)
    let shouldLiquidate = false;

    if (
      pos.stopLoss &&
      (
        (pos.type === "long" && currentPrice <= pos.stopLoss) ||
        (pos.type === "short" && currentPrice >= pos.stopLoss)
      )
    ) {
      shouldLiquidate = true;
    }

    if (
      pos.takeProfit &&
      (
        (pos.type === "long" && currentPrice >= pos.takeProfit) ||
        (pos.type === "short" && currentPrice <= pos.takeProfit)
      )
    ) {
      shouldLiquidate = true;
    }

    if (pnl <= -Number(pos.margin)) {
      shouldLiquidate = true;
    }

    if (shouldLiquidate) {
      await prisma.position.update({
        where: { positionId: pos.positionId },
        data: {
          status: "liquidated",
          closedPrice: currentPrice,
          closedAt: new Date(),
          isLiquidated: true,
        },
      });
      openPositionIds.delete(id);
      console.log(`Position ${id} liquidated at price ${currentPrice}`);

      // Emit event to frontend
      io.to(`user_${pos.userId}`).emit('position_liquidated', {
        positionId: pos.positionId,
        closedPrice: currentPrice,
        pnl, // if you calculate it
      });
    }
  }
}
async function start() {
  await initKafkaConsumer();
  setInterval(checkAndLiquidatePositions, 10 * 1000); // every 10 seconds
  console.log('Liquidation cron started (every 10 seconds).');
}
start().catch(console.error);