const WebSocket = require('ws')
const assets = ['btcusdt', 'ethusdt', 'solusdt']

const { createClient } = require('redis')
const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' })


const { Kafka } = require('kafkajs')

const kafkaClient = new Kafka({
    clientId: 'binance-publisher',
    brokers: [(process.env.KAFKA_BROKER || "localhost:9092")],
})
const producer = kafkaClient.producer()

module.exports.startBinanceStreams = async () => {
    let redisConnected = false;
    while (!redisConnected) {
        try {
            await redisClient.connect();
            redisConnected = true;
            console.log('Binance Publisher: Redis Connected');
        } catch (err) {
            console.error('Binance Publisher: Redis connection failed, retrying in 5s...', err.message);
            await new Promise(res => setTimeout(res, 5000));
        }
    }

    let kafkaConnected = false;
    while (!kafkaConnected) {
        try {
            await producer.connect();
            kafkaConnected = true;
            console.log('Binance Publisher: Kafka Connected');
        } catch (err) {
            console.error('Binance Publisher: Kafka connection failed, retrying in 5s...', err.message);
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    assets.forEach(asset => {
        const streamUrl = `wss://stream.binance.com:9443/ws/${asset}@trade`
        const ws = new WebSocket(streamUrl)

        ws.on('open', () => {
            console.log(`Connected to ${asset} stream`)
        })
        ws.on('message', async (trade) => {
            // console.log(`New trade in ${asset} stream:`, JSON.parse(trade.toString()))
            const tradeData = JSON.parse(trade.toString())
            const payload = {
                asset: asset,
                price: tradeData.p,
                quantity: tradeData.q,
                tradeTime: tradeData.T
            }

            const message = JSON.stringify(payload)
            //    console.log(`New trade in ${asset} stream:`, message)
            //    console.log(`Publishing message to Redis and Kafka`)
            try {
                await redisClient.publish('trades', message)
                await redisClient.set(`price:${asset.toUpperCase()}`, tradeData.p);
                await producer.send({
                    topic: 'binance-trades',
                    messages: [
                        { value: message }
                    ]
                })
            } catch (err) {
                console.error('Redis or kafka publish error:', err)
            }
        })
        ws.on('close', () => {
            console.log(`Disconnected from ${asset} stream`)
        })
        ws.on('error', (error) => {
            console.error(`Error in ${asset} stream:`, error)
        })
    })
}
