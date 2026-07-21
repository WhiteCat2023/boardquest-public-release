import { UserRole } from "@/types/question";

export type RoleType = UserRole;

export interface Department {
  id: string;
  name: string;
}

export interface FacultyMember {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  username: string;
  role: RoleType;
  phoneNumber: string;
  departmentId: string;
  department: {
    id: string;
    name: string;
  };
  isActive?: boolean;
  lastActiveAt?: string;
  createdAt: string;
}

export interface CreateFacultyPayload {
  employeeId: string;
  name: string;
  email: string;
  username: string;
  password: string;
  phoneNumber: string;
  departmentId: string;
  role: RoleType;
}

export interface RoleOption {
  value: RoleType;
  label: string;
  description: string;
}
