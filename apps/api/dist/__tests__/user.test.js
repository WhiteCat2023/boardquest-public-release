import "./setup";
import request from "supertest";
import express from "express";
import userRouter from "../routes/admin/user.routes";
import * as userService from "../services/admin/user.service";
import { ApiError } from "../utils/apiError";
import { authenticateToken } from "../middleware/auth.middleware";
// Mock user services
jest.mock("../services/admin/user.service");
let app;
beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/users", userRouter);
    app.use("/api/faculty", userRouter);
});
describe("User & Faculty Management Routes", () => {
    const mockUserMember = {
        id: "user-1",
        employeeId: "EMP-001",
        name: "Jane Doe",
        email: "jane@example.com",
        role: "TEACHER",
        phoneNumber: "09171234567",
        accountStatus: "ACTIVE",
        isActive: true,
        handledSubjectIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    afterEach(() => {
        jest.clearAllMocks();
        // Restore default auth mock implementation (DEAN role)
        authenticateToken.mockImplementation((req, res, next) => {
            req.user = {
                id: "1",
                email: "admin@example.com",
                role: "DEAN",
                name: "Dean User",
            };
            next();
        });
    });
    describe("GET /api/users (and /api/faculty)", () => {
        it("should retrieve all user members and sanitize passwords", async () => {
            const mockUserList = [
                { ...mockUserMember, password: "hashedpassword" },
                {
                    id: "user-2",
                    employeeId: "EMP-002",
                    name: "John Smith",
                    email: "john@example.com",
                    role: "TEAMLEAD",
                    phoneNumber: "09177654321",
                    password: "hashedpassword2",
                },
            ];
            userService.getAllUsers.mockResolvedValue(mockUserList);
            const response = await request(app).get("/api/users");
            expect(response.status).toBe(200);
            expect(response.body.data.users).toHaveLength(2);
            expect(response.body.data.faculties).toHaveLength(2);
            // Verify passwords are sanitized out
            expect(response.body.data.users[0].password).toBeUndefined();
            expect(response.body.data.users[1].password).toBeUndefined();
            expect(response.body.data.users[0].name).toBe("Jane Doe");
        });
        it("should block GET request if role is not authorized (e.g. TEACHER)", async () => {
            authenticateToken.mockImplementation((req, res, next) => {
                req.user = {
                    id: "3",
                    email: "teacher@example.com",
                    role: "TEACHER",
                    name: "Teacher User",
                };
                next();
            });
            const response = await request(app).get("/api/users");
            expect(response.status).toBe(403);
            expect(response.body.error).toBe("INSUFFICIENT_PRIVILEGES");
        });
    });
    describe("POST /api/users (and /api/faculty)", () => {
        const createPayload = {
            employeeId: "EMP-001",
            name: "Jane Doe",
            email: "jane@example.com",
            password: "password123",
            phoneNumber: "09171234567",
            role: "TEACHER",
        };
        it("should create a new user member successfully and sanitize password", async () => {
            userService.createUser.mockResolvedValue({
                ...mockUserMember,
                password: "password123",
            });
            const response = await request(app)
                .post("/api/users")
                .send(createPayload);
            expect(response.status).toBe(201);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.password).toBeUndefined();
            expect(response.body.data.user.employeeId).toBe("EMP-001");
            expect(userService.createUser).toHaveBeenCalledWith(createPayload, "DEAN");
        });
        it("should handle validation or logic error from service", async () => {
            userService.createUser.mockRejectedValue(new ApiError(400, "Invalid input data"));
            const response = await request(app)
                .post("/api/users")
                .send(createPayload);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid input data");
        });
        it("should block creation if user is not authorized (e.g. TEACHER)", async () => {
            authenticateToken.mockImplementation((req, res, next) => {
                req.user = { id: "3", email: "teacher@example.com", role: "TEACHER" };
                next();
            });
            const response = await request(app)
                .post("/api/users")
                .send(createPayload);
            expect(response.status).toBe(403);
        });
    });
    describe("PATCH /api/users/:id/status", () => {
        it("should toggle user active status successfully", async () => {
            userService.toggleUserStatus.mockResolvedValue({
                ...mockUserMember,
                accountStatus: "DEACTIVATED",
                isActive: false,
            });
            const response = await request(app)
                .patch("/api/users/user-1/status")
                .send({ accountStatus: "DEACTIVATED" });
            expect(response.status).toBe(200);
            expect(response.body.data.user.accountStatus).toBe("DEACTIVATED");
        });
    });
    describe("PATCH /api/users/:id/subjects (and /categories)", () => {
        it("should update handled subjects successfully", async () => {
            userService.updateUserCategories.mockResolvedValue({
                ...mockUserMember,
                handledSubjectIds: ["sub-1", "sub-2"],
            });
            const response = await request(app)
                .patch("/api/users/user-1/subjects")
                .send({ subjectIds: ["sub-1", "sub-2"] });
            expect(response.status).toBe(200);
            expect(response.body.data.user.handledSubjectIds).toEqual(["sub-1", "sub-2"]);
        });
    });
});
