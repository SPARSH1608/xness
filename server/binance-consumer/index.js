const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { Kafka } = require('kafkajs')
const { Client } = require('pg')
const kafkaClient = new Kafka({
  clientId: 'binance-consumer',
  brokers: [(process.env.KAFKA_BROKER || "localhost:9092")],
})
const consumer = kafkaClient.consumer({ groupId: 'trade-group' })

const pgClientConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
    user: process.env.DB_USER || 'sparsh',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'timescale',
    password: process.env.DB_PASSWORD || 'sparsh',
    port: process.env.DB_PORT || 5432,
  };

const pgClient = new Client(pgClientConfig)

async function startBatchCycle() {
  while (true) {
    for (const [asset, trades] of tradeBatches.entries()) {
      if (trades.length === 0) continue;
      console.log(`[Consumer] Processing batch for ${asset}: ${trades.length} trades`);
      await insertBatch(asset, trades);
      tradeBatches.set(asset, []);
    }
    await new Promise(res => setTimeout(res, 5000)); // Reduced to 5s for faster debugging
  }
}

const tradeBatches = new Map()
const messageStats = { btcusdt: 0, ethusdt: 0, solusdt: 0 }

setInterval(() => {
  console.log(`[Consumer Stats] Last 10s: BTC: ${messageStats.btcusdt}, ETH: ${messageStats.ethusdt}, SOL: ${messageStats.solusdt}`);
  messageStats.btcusdt = 0;
  messageStats.ethusdt = 0;
  messageStats.solusdt = 0;
}, 10000);

async function startConsumer() {
  let kafkaConnected = false;
  while (!kafkaConnected) {
    try {
      await consumer.connect()
      kafkaConnected = true;
      console.log('Binance Consumer: Kafka Connected');
    } catch (err) {
      console.error('Binance Consumer: Kafka connection failed, retrying in 5s...', err.message);
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  let pgConnected = false;
  while (!pgConnected) {
    try {
      await pgClient.connect()
      pgConnected = true;
      console.log('Binance Consumer: Postgres Connected');
    } catch (err) {
      console.error('Binance Consumer: Postgres connection failed, retrying in 5s...', err.message);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  await consumer.subscribe({ topic: 'binance-trades', fromBeginning: false })
  // console.log('subscribed to topic:binance-trades')

  startBatchCycle()
  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const tradeString = message.value.toString()
        const trade = JSON.parse(tradeString)

        const asset = trade.asset ? trade.asset.toLowerCase() : 'unknown';
        if (messageStats[asset] !== undefined) {
          messageStats[asset]++;
        }

        if (asset === 'ethusdt') {
          // Optional: log every 10th ETH trade for high-frequency assets
          // if (messageStats.ethusdt % 10 === 0) process.stdout.write('E');
        }

        if (!tradeBatches.has(asset)) {
          tradeBatches.set(asset, [])
        }
        tradeBatches.get(asset).push(trade)
      } catch (err) {
        console.error('[Consumer] Error processing single message:', err.message);
      }
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
      console.error(`[Consumer] Error inserting trade for ${asset}:`, err.message);
    }
  }
}

startConsumer().catch(console.error)