const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379
});

redis.on('connect', () => {
  console.log('Redis conectado');
});

module.exports = redis;