const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { Kafka } = require('kafkajs')
const { Client } = require('pg')
const kafkaClient = new Kafka({
  clientId: 'binance-consumer',
  brokers: ["localhost:9092"],
})
const consumer = kafkaClient.consumer({ groupId: 'trade-group' })

const pgClient = new Client({
  user: 'sparsh',
  host: 'localhost',
  database: 'timescale',
  password: 'sparsh',
  port: 5432,
})

async function startBatchCycle() {
  while (true) {
    for (const [asset, trades] of tradeBatches.entries()) {
      if (trades.length === 0) continue;
      await insertBatch(asset, trades);
      tradeBatches.set(asset, []);
    }
    await new Promise(res => setTimeout(res, 20000));
  }
}

const tradeBatches = new Map()
async function startConsumer() {
  await consumer.connect()
  await pgClient.connect()
  await consumer.subscribe({ topic: 'binance-trades', fromBeginning: false })
  // console.log('subscribed to topic:binance-trades')

  startBatchCycle()
  await consumer.run({
    eachMessage: async ({ message }) => {
      const tradeString = message.value.toString()
      const trade = JSON.parse(tradeString)
      // console.log('received trade')

      if (!tradeBatches.has(trade.asset)) {
        tradeBatches.set(trade.asset, [])
      }
      tradeBatches.get(trade.asset).push(trade)
    }
  })
}

async function insertBatch(asset, trades) {
  const query = `
    INSERT INTO trades (asset, price, quantity, trade_time)
    VALUES ($1, $2, $3, $4)
  `;

  for (const trade of trades) {
    const values = [
      asset,
      trade.price,
      trade.quantity,
      new Date(trade.tradeTime),
    ];

    try {
      await pgClient.query(query, values);
    } catch (err) {
      console.error('Error inserting trade:', err);
    }
  }
}

startConsumer().catch(console.error)