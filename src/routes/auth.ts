import bcrypt from 'bcryptjs';
import { FastifyInstance } from 'fastify';
import sql from '../db';
import { authenticate } from '../utils/authenticate';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/login', async (request, reply) => {
    const user = await authenticate(request, reply);
    if (!user) return;

    return { message: 'Login successful', userId: user.id };
  });

  fastify.post('/auth/change-password', async (request, reply) => {
    const user = await authenticate(request, reply);
    if (!user) return;

    const { newPassword } = request.body as { newPassword: string };
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await sql`
      UPDATE users SET password = ${hashedPassword} WHERE username = ${user.username}
    `;

    return { message: 'Password changed successfully' };
  });
}
