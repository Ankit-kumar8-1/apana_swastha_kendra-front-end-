// src/types/user.ts

import type { UserRole, UserStatus } from "./auth";

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;

  stateId: string | null;
  stateName: string | null;
  districtId: string | null;
  districtName: string | null;
  blockId: string | null;
  blockName: string | null;
  centerId: string | null;
  centerName: string | null;

  parentId: string | null;
  associateCode: string | null;

  effectivePermissions: string[];

  tempPassword: string | null;
  lastLoginAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  stateId?: string | null;
  districtId?: string | null;
  blockId?: string | null;
  centerId?: string | null;
  customPermissions?: string[] | null;
}

export interface UpdateStatusRequest {
  status: UserStatus;
  reason?: string;
}

export interface UpdatePermissionRequest {
  permission: string;
  granted: boolean;
  reason?: string;
}

export interface PermissionProfile {
  role: UserRole;
  defaultPermissions: string[];
  additionalPermissions: string[];
  revokedPermissions: string[];
  effectivePermissions: string[];
}

export interface UsersFilters {
  search: string;
  role: UserRole | "";
  status: UserStatus | "";
}
