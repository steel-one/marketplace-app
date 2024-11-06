import bcrypt from 'bcryptjs';
import fastify from 'fastify';
import sql from '../db';
import authRoutes from './auth';

jest.mock('../db');

const mockUser = {
  id: 1,
  username: 'testuser',
  password: bcrypt.hashSync('testpassword', 10),
};

describe('Auth Routes', () => {
  const app = fastify();
  app.register(authRoutes);

  beforeEach(() => {
    (sql as jest.MockedFunction<typeof sql>).mockReset();
  });

  it('should login successfully with valid credentials', async () => {
    (sql as jest.MockedFunction<typeof sql>).mockResolvedValueOnce([
      mockUser,
    ] as any);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      headers: {
        authorization: `Basic ${Buffer.from('testuser:testpassword').toString(
          'base64',
        )}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: 'Login successful',
      userId: mockUser.id,
    });
  });

  it('should fail login with invalid credentials', async () => {
    (sql as jest.MockedFunction<typeof sql>).mockResolvedValueOnce([
      mockUser,
    ] as any);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      headers: {
        authorization: `Basic ${Buffer.from('testuser:wrongpassword').toString(
          'base64',
        )}`,
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'Invalid credentials' });
  });

  it('should change password successfully with valid credentials', async () => {
    (sql as jest.MockedFunction<typeof sql>).mockResolvedValueOnce([
      mockUser,
    ] as any);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/change-password',
      headers: {
        authorization: `Basic ${Buffer.from('testuser:testpassword').toString(
          'base64',
        )}`,
      },
      payload: {
        newPassword: 'newpassword',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: 'Password changed successfully',
    });
  });

  it('should fail to change password with invalid credentials', async () => {
    (sql as jest.MockedFunction<typeof sql>).mockResolvedValueOnce([
      mockUser,
    ] as any);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/change-password',
      headers: {
        authorization: `Basic ${Buffer.from('testuser:wrongpassword').toString(
          'base64',
        )}`,
      },
      payload: {
        newPassword: 'newpassword',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'Invalid credentials' });
  });
});
