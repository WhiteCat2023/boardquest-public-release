import { UserRole } from "@/types/question";

export type RoleType = UserRole;

export interface Subject {
  id: string;
  name: string;
  icon?: string;
  code?: string;
}

export type Category = Subject;

export interface UserMember {
  id: string;
  employeeId: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  role: RoleType;
  phoneNumber: string;
  avatarUrl?: string;
  companyName?: string;
  location?: string;
  handledSubjects?: Subject[];
  handledSubjectIds?: string[];
  handledCategories?: Category[];
  handledCategoryIds?: string[];
  accountStatus?: "ACTIVE" | "DEACTIVATED" | string;
  account_status?: "ACTIVE" | "DEACTIVATED" | string;
  isActive?: boolean;
  lastActiveAt?: string;
  createdAt: string;
}

export type FacultyMember = UserMember;

export interface CreateUserPayload {
  employeeId: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  password?: string;
  phoneNumber: string;
  companyName?: string;
  location?: string;
  handledSubjectIds?: string[];
  handledCategoryIds?: string[];
  role: RoleType;
}

export type CreateFacultyPayload = CreateUserPayload;

export interface RoleOption {
  value: RoleType;
  label: string;
  description: string;
}

export interface ParsedUserRow {
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  role: string;
  employeeId?: string;
  phoneNumber?: string;
  companyName?: string;
  location?: string;
  isValid: boolean;
  validationError?: string;
}

export type ParsedFacultyRow = ParsedUserRow;
