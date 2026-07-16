import { ApiError } from "../utils/apiError";
import { hashedPassword, verifyPassword } from "../utils/hash";
import prisma from "./prisma";
import { z } from "zod";

/*

addNewAdminUser = Functionality for super admin to send sign up link to new admin users

*/
export const addNewAdminUserSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["ADMIN", "TEACHER", "TEAMLEAD", "SUPERADMIN"], "Role required"),
});

// Alias for backward compatibility
export const addNewAdminUser = addNewAdminUserSchema;

export const createAdminUserSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["ADMIN", "TEACHER", "TEAMLEAD", "SUPERADMIN"], "Role required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 11 digits"),
  departmentId: z.string().min(1, "Department ID is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password is required"),
});

export const createReviewCenterRepUserSchema = z
  .object({
    employeeId: z.string().min(1, "Employee ID is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    companyName: z.string().min(1, "Company Name is required"),
    phoneNumber: z.string().min(11, "Phone number must be at least 11 digits"),
    password: z.string().min(12, "Password must be at least 12 characters"),
    confirmPassword: z
      .string()
      .min(12, "Confirm Password must be at least 12 characters"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

type addNewAdminUserInput = z.infer<typeof addNewAdminUserSchema>;
type createAdminUserInput = z.infer<typeof createAdminUserSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type createReviewCenterRepUserInput = z.infer<typeof createReviewCenterRepUserSchema>;

export class AuthService {
  constructor(private readonly db: typeof prisma = prisma) {}

  async login(data: LoginInput) {
    const parsed = loginSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;

      throw new ApiError(400, "Email or Password is not valid", [
        JSON.stringify(errors),
      ]);
    }

    const { email, password } = parsed.data;

    const user = await this.db.adminUser.findUnique({ where: { email } });

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isValid =
      (await verifyPassword(user.password, password)) ||
      user.password === password;

    if (!isValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    return user;
  }

  async createNewAdminUser(data: addNewAdminUserInput) {
    const parsed = addNewAdminUserSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten();
      throw new ApiError(400, "Email or Password is not valid", [
        JSON.stringify(errors),
      ]);
    }

    //sends email with sign up link to the new admin user
  }

  createNewStudent() {}
  createNewPartner() {}

  async signupAdmin(data: createAdminUserInput) {
    const parsed = createAdminUserSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten();
      throw new ApiError(400, "Email or Password is not valid", [
        JSON.stringify(errors),
      ]);
    }

    const { employeeId, name, email, role, phoneNumber, departmentId, username, password } = parsed.data;

    const existingUser = await this.db.adminUser.findFirst({
      where: { OR: [{ email }, { username }, { employeeId }] },
    });

    if (existingUser) {
      throw new ApiError(409, "Email already in use");
    }

    const hash = await hashedPassword(password);
    const user = await this.db.adminUser.create({
      data: {
        employeeId,
        username,
        email,
        name,
        role,
        phoneNumber,
        departmentId,
        password: hash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
      },
    });

    return user;
  }

  async signupReviewCenterRep(data: createReviewCenterRepUserInput) {
    const parsed = createReviewCenterRepUserSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten();
      throw new ApiError(400, "Email or Password is not valid", [
        JSON.stringify(errors),
      ]);
    }

    // SEND SIGN UP LINK TO REVIEW CENTER REPRESENTATIVE
  }
}

export const authService = new AuthService();

export const login = authService.login.bind(authService);
export const createNewAdminUser = authService.createNewAdminUser.bind(authService);
export const createNewStudent = authService.createNewStudent.bind(authService);
export const createNewPartner = authService.createNewPartner.bind(authService);
export const signupAdmin = authService.signupAdmin.bind(authService);
export const signupReviewCenterRep = authService.signupReviewCenterRep.bind(authService);
