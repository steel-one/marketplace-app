import bcrypt from 'bcryptjs';
import { FastifyInstance } from 'fastify';
import sql from '../db';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/login', async (request, reply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return reply
        .status(401)
        .send({ error: 'Missing or invalid Authorization header' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii',
    );
    const [username, password] = credentials.split(':');

    const [user] = await sql`
      SELECT * FROM users WHERE username = ${username}
    `;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }
    return { message: 'Login successful', userId: user.id };
  });

  fastify.post('/auth/change-password', async (request, reply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return reply
        .status(401)
        .send({ error: 'Missing or invalid Authorization header' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii',
    );
    const [username, oldPassword] = credentials.split(':');

    const { newPassword } = request.body as {
      newPassword: string;
    };
    const [user] = await sql`
      SELECT * FROM users WHERE username = ${username}
    `;

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await sql`
      UPDATE users SET password = ${hashedPassword} WHERE username = ${username}
    `;
    return { message: 'Password changed successfully' };
  });
}
