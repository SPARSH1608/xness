const { createClient } = require('redis')

async function startRedisSubscriber(io) {
    const redisSub = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6380' });

    redisSub.on('error', (err) => {
        // console.log('redis subscriber error', err)
    })

    let connected = false;
    while (!connected) {
        try {
            await redisSub.connect();
            connected = true;
            console.log('Redis subscriber connected and listening to trades channel');
        } catch (err) {
            console.error('Redis subscriber connection failed, retrying in 5s...', err.message);
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    await redisSub.subscribe('trades', (message) => {
        try {
            const trade = JSON.parse(message)

            io.to(trade.asset).emit('trade', trade)
            // console.log('Emitted trade event:', message)
        } catch (err) {
            console.error('Error emitting trade event:', err)
        }
    })
    console.log('Redis subscriber connected and listening to trades channel')
}
module.exports = startRedisSubscriber