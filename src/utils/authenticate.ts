import bcrypt from 'bcryptjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import sql from '../db';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    reply
      .status(401)
      .send({ error: 'Missing or invalid Authorization header' });
    return null;
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
    reply.status(401).send({ error: 'Invalid credentials' });
    return null;
  }

  return user;
}
