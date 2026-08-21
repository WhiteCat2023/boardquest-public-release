import { UserRole } from "@/types/question";

export type RoleType = UserRole;

export interface Category {
  id: string;
  name: string;
}

export interface FacultyMember {
  id: string;
  employeeId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: RoleType;
  phoneNumber: string;
  handledCategories?: Category[];
  handledCategoryIds?: string[];
  isActive?: boolean;
  lastActiveAt?: string;
  createdAt: string;
}

export interface CreateFacultyPayload {
  employeeId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  phoneNumber: string;
  handledCategoryIds?: string[];
  role: RoleType;
}

export interface RoleOption {
  value: RoleType;
  label: string;
  description: string;
}

export interface ParsedFacultyRow {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  employeeId?: string;
  phoneNumber?: string;
  isValid: boolean;
  validationError?: string;
}
