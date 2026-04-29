// src/types/auth.ts

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "STATE_MANAGER"
  | "DISTRICT_MANAGER"
  | "BLOCK_MANAGER"
  | "HR_MANAGER"
  | "DOCTOR"
  | "PHARMACIST"
  | "RECEPTIONIST"
  | "CENTER_STAFF"
  | "ASSOCIATE"
  | "FAMILY"
  | "VENDOR";

export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED" | "SUSPENDED";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  permissions: string[];
  stateId: string | null;
  districtId: string | null;
  blockId: string | null;
  centerId: string | null;
  lastLoginAt: string | null;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
