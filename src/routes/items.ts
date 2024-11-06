import fastifyCompress from '@fastify/compress';
import axios from 'axios';
import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { authenticate } from '../utils/authenticate';

interface IResponse {
  data: IData[];
}

interface IData {
  market_hash_name: string;
  currency: string;
  suggested_price: number;
  item_page: string;
  market_page: string;
  min_price: number;
  max_price: number;
  mean_price: number;
  quantity: number;
  created_at: number;
  updated_at: number;
}

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
});

async function fetchItems(tradable: boolean) {
  try {
    const response: IResponse = await axios.get(
      'https://api.skinport.com/v1/items',
      {
        params: {
          app_id: process.env.DEFAULT_APP_ID,
          currency: process.env.DEFAULT_CURRENCY,
          tradable,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch items with tradable=${tradable}:`, error);
    throw error;
  }
}

export default async function itemRoutes(fastify: FastifyInstance) {
  fastify.register(fastifyCompress);

  fastify.get('/items', async (request, reply) => {
    const { page = 1, limit = 50 } = request.query as {
      page?: number;
      limit?: number;
    };

    const user = await authenticate(request, reply);
    if (!user) return;

    const cacheKey = `items:${page}:${limit}`;
    const cachedItems = await redis.get(cacheKey);
    if (cachedItems) {
      return JSON.parse(cachedItems);
    }

    const [nonTradableResponse, tradableResponse] = await Promise.all([
      fetchItems(false),
      fetchItems(true),
    ]);

    const nonTradableItems = nonTradableResponse.reduce(
      (acc: Record<string, number>, item: IData) => {
        acc[item.market_hash_name] = item.min_price;
        return acc;
      },
      {},
    );

    const allItems = tradableResponse.map((tradableItem: any) => {
      return {
        name: tradableItem.market_hash_name,
        tradable_price: tradableItem.min_price,
        non_tradable_price:
          nonTradableItems[tradableItem.market_hash_name] || null,
      };
    });

    const paginatedItems = allItems.slice((page - 1) * limit, page * limit);
    await redis.set(cacheKey, JSON.stringify(paginatedItems), 'EX', 3600);

    return paginatedItems;
  });
}
