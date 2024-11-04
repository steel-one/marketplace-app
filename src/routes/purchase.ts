import { FastifyInstance } from 'fastify';
import sql from '../db';

export default async function purchaseRoutes(fastify: FastifyInstance) {
  fastify.post('/purchase', async (request, reply) => {
    const { userId, itemId } = request.body as {
      userId: number;
      itemId: number;
    };

    const [user] = await sql`SELECT * FROM users WHERE id = ${userId}`;
    const [item] = await sql`SELECT * FROM items WHERE id = ${itemId}`;

    if (!user || !item || user.balance < item.tradable_price) {
      return reply
        .status(400)
        .send({ error: 'Insufficient balance or invalid item' });
    }

    await sql.begin(async (sql) => {
      await sql`
                UPDATE users SET balance = balance - ${item.tradable_price} WHERE id = ${userId}
            `;
      await sql`
                INSERT INTO purchases (user_id, item_id, price) VALUES (${userId}, ${itemId}, ${item.tradable_price})
            `;
    });

    const [updatedUser] = await sql`
            SELECT balance FROM users WHERE id = ${userId}
        `;
    return { newBalance: updatedUser.balance };
  });
}
