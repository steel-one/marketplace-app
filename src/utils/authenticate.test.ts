import bcrypt from 'bcryptjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import sql from '../db';
import { authenticate } from './authenticate';

jest.mock('../db');

const mockUser = {
  id: 1,
  username: 'testuser',
  password: bcrypt.hashSync('testpassword', 10),
};

describe('authenticate', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      headers: {},
    };
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    (sql as jest.MockedFunction<typeof sql>).mockReset();
  });

  it('should return null and send 401 if Authorization header is missing', async () => {
    const result = await authenticate(
      request as FastifyRequest,
      reply as FastifyReply,
    );

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      error: 'Missing or invalid Authorization header',
    });
    expect(result).toBeNull();
  });

  it('should return null and send 401 if credentials are invalid', async () => {
    request.headers = request.headers || {};
    request.headers.authorization = `Basic ${Buffer.from(
      'testuser:wrongpassword',
    ).toString('base64')}`;
    (sql as jest.MockedFunction<typeof sql>).mockResolvedValueOnce([
      mockUser,
    ] as any);

    const result = await authenticate(
      request as FastifyRequest,
      reply as FastifyReply,
    );

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    expect(result).toBeNull();
  });

  it('should return user if credentials are valid', async () => {
    request.headers = request.headers || {};
    request.headers.authorization = `Basic ${Buffer.from(
      'testuser:testpassword',
    ).toString('base64')}`;
    (sql as jest.MockedFunction<typeof sql>).mockResolvedValueOnce([
      mockUser,
    ] as any);

    const result = await authenticate(
      request as FastifyRequest,
      reply as FastifyReply,
    );

    expect(reply.status).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });
});
