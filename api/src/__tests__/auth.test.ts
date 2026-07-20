import './setup';
import request from 'supertest';
import express, { Express } from 'express';
import authRouter from '../routes/auth.routes';
import * as authService from '../services/auth.services';
import { ApiError } from '../utils/apiError';

// Mock auth services
jest.mock('../services/auth.services');

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
});

describe('Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new admin user', async () => {
      const newUser = {
        id: '1',
        email: 'newadmin@example.com',
        password: 'hashed_password',
        role: 'ADMIN',
      };

      (authService.signupAdmin as jest.Mock).mockResolvedValue(newUser);

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'newadmin@example.com',
          password: 'password123',
          name: 'New Admin',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.message).toContain('successfully');
    });

    it('should return 400 for invalid input', async () => {
      (authService.signupAdmin as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Invalid input')
      );

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: '123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user successfully', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'ADMIN',
      };

      (authService.login as jest.Mock).mockResolvedValue(user);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should return 401 for invalid credentials', async () => {
      (authService.login as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid');
    });

    it('should set cookies on successful login', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'ADMIN',
      };

      (authService.login as jest.Mock).mockResolvedValue(user);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('logged out');
    });

    it('should clear cookies on logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
      };

      const prisma = (await import('../services/prisma')).default;
      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValue(user);

      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, res, next) => {
        req.cookies = { accessToken: 'valid_token' };
        next();
      });
      testApp.use('/api/auth', authRouter);

      const response = await request(testApp)
        .get('/api/auth/me');

      expect(response.status).toBe(200);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should return 401 if no token is provided', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, res, next) => {
        req.cookies = {};
        next();
      });
      testApp.use('/api/auth', authRouter);

      const response = await request(testApp)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/refresh', () => {
    it('should refresh access token', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, res, next) => {
        req.cookies = { refreshToken: 'valid_refresh_token' };
        next();
      });
      testApp.use('/api/auth', authRouter);

      const response = await request(testApp)
        .get('/api/auth/refresh');

      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 if no refresh token', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, res, next) => {
        req.cookies = {};
        next();
      });
      testApp.use('/api/auth', authRouter);

      const response = await request(testApp)
        .get('/api/auth/refresh');

      expect(response.status).toBe(401);
    });

    it('should return 401 if refresh token is expired', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, res, next) => {
        req.cookies = { refreshToken: 'expired_token' };
        next();
      });
      testApp.use('/api/auth', authRouter);

      const response = await request(testApp)
        .get('/api/auth/refresh');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should process password reset request successfully', async () => {
      (authService.forgotPassword as jest.Mock).mockResolvedValue({
        message: 'If an account with that email exists, password reset instructions have been sent.',
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'user@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('processed successfully');
    });

    it('should handle invalid email or service error', async () => {
      (authService.forgotPassword as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Valid email address is required')
      );

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password successfully with valid token', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({
        message: 'Password has been reset successfully.',
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid_reset_token',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('reset');
    });

    it('should return 400 for invalid token or password mismatch', async () => {
      (authService.resetPassword as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Invalid or expired password reset token')
      );

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid_token',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        });

      expect(response.status).toBe(400);
    });
  });
});
