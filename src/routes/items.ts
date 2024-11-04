import axios from 'axios';
import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
});

export default async function itemRoutes(fastify: FastifyInstance) {
  fastify.get('/items', async (request, reply) => {
    const cachedItems = await redis.get('items');
    if (cachedItems) {
      return JSON.parse(cachedItems);
    }

    const response = await axios.get('https://api.skinport.com/items', {
      params: { app_id: 'default', currency: 'default' },
    });
    const items = response.data.map((item: any) => ({
      name: item.name,
      tradable_price: item.tradable_price,
      non_tradable_price: item.non_tradable_price,
    }));

    await redis.set('items', JSON.stringify(items), 'EX', 3600); // Кешируем на 1 час
    return items;
  });
}
