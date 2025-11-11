const { createClient } = require('redis');

const redis = createClient({ url: 'redis://localhost:6380' });

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redis.connect();

module.exports = redis;