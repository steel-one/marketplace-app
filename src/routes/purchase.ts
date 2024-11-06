import { FastifyInstance } from 'fastify';
import sql from '../db';
import { authenticate } from '../utils/authenticate';

export default async function purchaseRoutes(fastify: FastifyInstance) {
  fastify.post('/purchase', async (request, reply) => {
    const user = await authenticate(request, reply);
    if (!user) return;

    const { userId, itemId, price } = request.body as {
      userId: number;
      itemId: number;
      price: number;
    };

    const [dbUser] = await sql`SELECT * FROM users WHERE id = ${userId}`;

    if (!dbUser || !price || dbUser.balance < price) {
      return reply
        .status(400)
        .send({ error: 'Insufficient balance or invalid item' });
    }

    await sql.begin(async (sql) => {
      await sql`
                UPDATE users SET balance = balance - ${price} WHERE id = ${userId}
            `;
      await sql`
                INSERT INTO purchases (user_id, item_id, price) VALUES (${userId}, ${itemId}, ${price})
            `;
    });

    const [updatedUser] = await sql`
            SELECT balance FROM users WHERE id = ${userId}
        `;
    return {
      balance: updatedUser.balance,
    };
  });
}
