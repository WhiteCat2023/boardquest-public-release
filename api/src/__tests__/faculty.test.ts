import './setup';
import request from 'supertest';
import express, { Express } from 'express';
import facultyRouter from '../routes/admin/faculty.routes';
import * as facultyService from '../services/admin/faculty.services';
import { ApiError } from '../utils/apiError';
import { authenticateToken } from '../middleware/auth.middleware';

// Mock faculty services
jest.mock('../services/admin/faculty.services');

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/faculty', facultyRouter);
});

describe('Faculty Routes', () => {
  const mockFacultyMember = {
    id: 'faculty-1',
    employeeId: 'EMP-001',
    name: 'Jane Doe',
    email: 'jane@example.com',
    username: 'janedoe',
    role: 'TEACHER',
    phoneNumber: '09171234567',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    jest.clearAllMocks();
    // Restore default auth mock implementation (ADMIN role)
    (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '1', email: 'admin@example.com', role: 'ADMIN', username: 'admin', name: 'Admin User' };
      next();
    });
  });

  describe('GET /api/faculty', () => {
    it('should retrieve all faculty members and sanitize passwords', async () => {
      const mockFacultyList = [
        { ...mockFacultyMember, password: 'hashedpassword' },
        { id: 'faculty-2', employeeId: 'EMP-002', name: 'John Smith', email: 'john@example.com', username: 'johnsmith', role: 'TEAMLEAD', phoneNumber: '09177654321', password: 'hashedpassword2' }
      ];

      (facultyService.getAllFaculty as jest.Mock).mockResolvedValue(mockFacultyList);

      const response = await request(app).get('/api/faculty');

      expect(response.status).toBe(200);
      expect(response.body.data.faculties).toHaveLength(2);
      // Verify passwords are sanitized out
      expect(response.body.data.faculties[0].password).toBeUndefined();
      expect(response.body.data.faculties[1].password).toBeUndefined();
      expect(response.body.data.faculties[0].name).toBe('Jane Doe');
    });

    it('should block GET request if role is not authorized (e.g. TEACHER)', async () => {
      // Mock user as TEACHER
      (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: '3', email: 'teacher@example.com', role: 'TEACHER', username: 'teacher', name: 'Teacher User' };
        next();
      });

      const response = await request(app).get('/api/faculty');
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('INSUFFICIENT_PRIVILEGES');
    });
  });

  describe('POST /api/faculty', () => {
    const createPayload = {
      employeeId: 'EMP-001',
      name: 'Jane Doe',
      email: 'jane@example.com',
      username: 'janedoe',
      password: 'password123',
      phoneNumber: '09171234567',
      role: 'TEACHER'
    };

    it('should create a new faculty member successfully and sanitize password', async () => {
      (facultyService.createFaculty as jest.Mock).mockResolvedValue({
        ...mockFacultyMember,
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/faculty')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.data.faculty).toBeDefined();
      expect(response.body.data.faculty.password).toBeUndefined();
      expect(response.body.data.faculty.employeeId).toBe('EMP-001');
      expect(facultyService.createFaculty).toHaveBeenCalledWith(createPayload, 'ADMIN');
    });

    it('should handle validation or logic error from service', async () => {
      (facultyService.createFaculty as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Invalid input data')
      );

      const response = await request(app)
        .post('/api/faculty')
        .send(createPayload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid input data');
    });

    it('should block creation if user is not authorized (e.g. TEACHER)', async () => {
      (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: '3', email: 'teacher@example.com', role: 'TEACHER' };
        next();
      });

      const response = await request(app)
        .post('/api/faculty')
        .send(createPayload);

      expect(response.status).toBe(403);
    });
  });
});
