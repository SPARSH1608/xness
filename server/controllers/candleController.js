const { Pool } = require('pg')
const redisClient = require('../redisClient')

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.POSTGRES_USER || 'sparsh';
const dbName = process.env.POSTGRES_DB || 'timescale';

if (process.env.DATABASE_URL) {
  console.log(`[CandleController] Connecting via DATABASE_URL (external)`);
} else {
  console.log(`[CandleController] Initializing connection to host: ${dbHost}, database: ${dbName}, user: ${dbUser}`);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${dbUser}:${process.env.POSTGRES_PASSWORD || 'sparsh'}@${dbHost}:5432/${dbName}?schema=public`
})

const viewMap = {
  "1min": "trades_1min",

  "3min": "trades_3min",
  "5min": "trades_5min",
  "10min": "trades_10min",
  "15min": "trades_15min",
  "30min": "trades_30min",
  "1h": "trades_1h",
  "2h": "trades_2h",
  "4h": "trades_4h",
  "1d": "trades_1d",
  "1w": "trades_1w",
  "1mo": "trades_1mo"
}

async function getCandleData(req, res) {
  const { asset, interval } = req.params
  console.log('Fetching candle data for:', asset, 'Interval:', interval)
  const smallCaseAsset = asset.toLowerCase()
  const viewName = viewMap[interval]
  if (!viewName) {
    return res.status(400).json({ error: "Invalid interval" })
  }
  try {
    const query = `
      SELECT bucket, open, high, low, close, volume
      FROM ${viewName}
      WHERE asset = $1
      ORDER BY bucket DESC
    `
    const result = await pool.query(query, [smallCaseAsset])
    const formatted = result.rows.map(c => ({
      time: Math.floor(new Date(c.bucket).getTime() / 1000),
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
      volume: Number(c.volume)
    }))
    res.json(formatted)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error fetching OHLC data')
  }
}

async function getPrices(req, res) {
  try {
    const assets = ['btc', 'eth', 'sol'];
    const prices = {};
    for (const asset of assets) {
      const price = await redisClient.get(`${asset}_price`);
      if (price) {
        prices[`${asset.toUpperCase()}USDT`] = price;
      }
    }
    res.json(prices);
  } catch (error) {
    console.error('Error fetching prices from Redis:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
}

module.exports = { getCandleData, getPrices }
