import bcrypt from 'bcryptjs';
import { FastifyInstance } from 'fastify';
import sql from '../db';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/login', async (request, reply) => {
    const { username, password } = request.body as {
      username: string;
      password: string;
    };
    const [user] = await sql`
          SELECT * FROM users WHERE username = ${username}
      `;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }
    return { message: 'Login successful', userId: user.id };
  });

  fastify.post('/auth/change-password', async (request, reply) => {
    const { userId, oldPassword, newPassword } = request.body as {
      userId: number;
      oldPassword: string;
      newPassword: string;
    };
    const [user] = await sql`
        SELECT * FROM users WHERE id = ${userId}
    `;

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await sql`
        UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}
    `;
    return { message: 'Password changed successfully' };
  });
}
