// Mock Prisma client
jest.mock('../services/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({}),
        },
        question: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({}),
        },
        questionComment: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({}),
            count: jest.fn().mockResolvedValue(0),
        },
        category: {
            findUnique: jest.fn().mockResolvedValue(null),
            findFirst: jest.fn().mockResolvedValue(null),
            findMany: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({}),
            count: jest.fn().mockResolvedValue(0),
        },
        subject: {
            findUnique: jest.fn().mockResolvedValue(null),
            findFirst: jest.fn().mockResolvedValue(null),
            findMany: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({}),
            count: jest.fn().mockResolvedValue(0),
        },
        learningModule: {
            findUnique: jest.fn().mockResolvedValue(null),
            findMany: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({}),
        },
        adminUser: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue([]),
        },
        studyPlan: {
            create: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue([]),
            delete: jest.fn().mockResolvedValue({}),
        },
        examResult: {
            create: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue([]),
        },
        achievement: {
            create: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue([]),
        },
        lessonCompletion: {
            create: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue([]),
        },
        subjectMastery: {
            update: jest.fn().mockResolvedValue({}),
            findUnique: jest.fn().mockResolvedValue(null),
        },
        reviewCenterRepresentativeUser: {
            findUnique: jest.fn().mockResolvedValue(null),
            findFirst: jest.fn().mockResolvedValue(null),
            findMany: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({}),
        },
        badge: {
            findUnique: jest.fn().mockResolvedValue(null),
            findMany: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({}),
        },
    },
}));
// Mock JWT utils
jest.mock('../utils/jwt.utils', () => ({
    signJWT: jest.fn((data, expiresIn) => 'mock_token'),
    verifyJWT: jest.fn((token) => {
        if (token === 'expired_token') {
            return { payload: null, expired: true };
        }
        if (token === 'invalid_token') {
            return { payload: null, expired: false };
        }
        return { payload: { id: '1', email: 'test@example.com', role: 'DEAN' }, expired: false };
    }),
    extractUserIdFromToken: jest.fn((token) => {
        if (token === 'expired_token' || token === 'invalid_token') {
            throw new Error('InvalidToken');
        }
        return '1';
    }),
    decodedId: jest.fn((token) => {
        if (token === 'expired_token' || token === 'invalid_token') {
            throw new Error('InvalidToken');
        }
        return '1';
    }),
}));
// Mock auth middleware module
jest.mock('../middleware/auth.middleware', () => ({
    authenticateToken: jest.fn((req, res, next) => {
        req.user = { id: '1', email: 'admin@example.com', role: 'DEAN', name: 'Dean User' };
        next();
    }),
    requireAdmin: jest.fn((req, res, next) => next()),
    requireRoles: jest.fn((roles) => (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Insufficient privileges",
                error: "INSUFFICIENT_PRIVILEGES",
            });
        }
        next();
    }),
    optionalAuth: jest.fn((req, res, next) => next()),
}));
// Mock auth middleware helper
export const mockAuthMiddleware = (req, res, next) => {
    req.user = { email: 'test@example.com', id: '123', role: 'DEAN' };
    next();
};
// Test data
export const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashed_password',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
};
export const mockAdminUser = {
    id: '2',
    email: 'admin@example.com',
    password: 'hashed_password',
    role: 'DEAN',
    createdAt: new Date(),
    updatedAt: new Date(),
};
export const mockQuestion = {
    id: '1',
    text: 'What is 2+2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    categoryId: '1',
    difficulty: 'EASY',
    createdAt: new Date(),
    updatedAt: new Date(),
};
export const mockCategory = {
    id: '1',
    name: 'Mathematics',
    createdAt: new Date(),
    updatedAt: new Date(),
};
export const mockSubject = mockCategory;
// Suppress noisy expected error logs during test runs
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
});
afterAll(() => {
    jest.restoreAllMocks();
});
