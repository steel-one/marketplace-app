// tslint: disable
// Important! config should be loaded before application module
// other way all env values will be undefined
import * as dotenv from 'dotenv';
dotenv.config({ path: `envs/${process.env.ENVIRONMENT}.env` });
// tslint: enable

import Fastify from 'fastify';
import authRoutes from './routes/auth';
import itemRoutes from './routes/items';
import purchaseRoutes from './routes/purchase';

const fastify = Fastify();

fastify.register(authRoutes);
fastify.register(itemRoutes);
fastify.register(purchaseRoutes);

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Server running on http://localhost:3000');
});
