const { createClient } = require('redis');

const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redis.on('error', (err) => {
  // Suppress immediate crashes, but log
  console.error('Redis Client Error (will retry)', err.message);
});

(async () => {
  let connected = false;
  while (!connected) {
    try {
      await redis.connect();
      connected = true;
      console.log('Redis Client Connected');
    } catch (err) {
      console.error('Redis Client connection failed, retrying in 5s...');
      await new Promise(res => setTimeout(res, 5000));
    }
  }
})();

module.exports = redis;