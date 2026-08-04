import './setup';
import request from 'supertest';
import express, { Express } from 'express';
import departmentRouter from '../routes/admin/department.routes';
import * as departmentService from '../services/admin/department.service';
import { ApiError } from '../utils/apiError';

// Mock department services
jest.mock('../services/admin/department.service');

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  // Mock auth middleware
  app.use((req, res, next) => {
    (req as any).user = { id: '1', role: 'ADMIN', email: 'admin@example.com' };
    next();
  });
  app.use('/api/departments', departmentRouter);
});

describe('Department Routes', () => {
  const mockDepartment = {
    id: '1',
    name: 'Computer Science',
    description: 'CS Department',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/departments/create', () => {
    it('should create a new department', async () => {
      (departmentService.createNewDepartment as jest.Mock).mockResolvedValue(
        mockDepartment
      );

      const response = await request(app)
        .post('/api/departments/create')
        .send({
          name: 'Computer Science',
          description: 'CS Department',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.department).toBeDefined();
      expect(response.body.data.department.name).toBe('Computer Science');
    });

    it('should handle missing required fields', async () => {
      (departmentService.createNewDepartment as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Name is required')
      );

      const response = await request(app)
        .post('/api/departments/create')
        .send({
          description: 'CS Department',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/departments/get', () => {
    it('should retrieve all departments', async () => {
      const departments = [
        mockDepartment,
        {
          id: '2',
          name: 'Mathematics',
          description: 'Math Department',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (departmentService.getAllDepartments as jest.Mock).mockResolvedValue(
        departments
      );

      const response = await request(app)
        .get('/api/departments/get');

      expect(response.status).toBe(200);
      expect(response.body.data.departments).toHaveLength(2);
      expect(response.body.message).toContain('retrieved');
    });

    it('should handle empty department list', async () => {
      (departmentService.getAllDepartments as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/departments/get');

      expect(response.status).toBe(200);
      expect(response.body.data.departments).toHaveLength(0);
    });
  });

  describe('PUT /api/departments/:departmentId', () => {
    it('should update a department', async () => {
      const updatedDepartment = {
        ...mockDepartment,
        name: 'Computer Science & Engineering',
      };

      (departmentService.updateDepartment as jest.Mock).mockResolvedValue(
        updatedDepartment
      );

      const response = await request(app)
        .put('/api/departments/1')
        .send({
          id: '1',
          name: 'Computer Science & Engineering',
          description: 'CS Department',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.department.name).toBe(
        'Computer Science & Engineering'
      );
    });

    it('should handle non-existent department', async () => {
      (departmentService.updateDepartment as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Department not found')
      );

      const response = await request(app)
        .put('/api/departments/999')
        .send({
          id: '999',
          name: 'Non-existent',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/departments/:departmentId', () => {
    it('should delete a department', async () => {
      (departmentService.deleteDepartment as jest.Mock).mockResolvedValue(
        undefined
      );

      const response = await request(app)
        .delete('/api/departments/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');
    });

    it('should handle non-existent department', async () => {
      (departmentService.deleteDepartment as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Department not found')
      );

      const response = await request(app)
        .delete('/api/departments/999');

      expect(response.status).toBe(400);
    });
  });
});
