// src/modules/users/api/usersApi.ts

import api from "@/lib/axios";
import type {
  UserResponse,
  CreateUserRequest,
  UpdateStatusRequest,
  UpdatePermissionRequest,
  PermissionProfile,
} from "@/types/user";
import type { ApiResponse } from "@/types/api";

function extractData<T>(res: ApiResponse<T>, fallbackMsg: string): T {
  if (!res || res.data === undefined || res.data === null) {
    throw new Error(fallbackMsg);
  }
  return res.data;
}

export const usersApi = {
  /** GET /users */
  async getUsers(): Promise<UserResponse[]> {
    const res = await api.get<ApiResponse<UserResponse[]>>("/users");
    return res.data.data ?? [];
  },

  /** GET /users/:userId */
  async getUser(userId: string): Promise<UserResponse> {
    const res = await api.get<ApiResponse<UserResponse>>(`/users/${userId}`);
    return extractData(res.data, "User not found");
  },

  /** POST /users */
  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const res = await api.post<ApiResponse<UserResponse>>("/users", data);
    return extractData(res.data, "Failed to create user");
  },

  /** PATCH /users/:userId/status */
  async updateStatus(
    userId: string,
    data: UpdateStatusRequest,
  ): Promise<UserResponse> {
    const res = await api.patch<ApiResponse<UserResponse>>(
      `/users/${userId}/status`,
      data,
    );
    return extractData(res.data, "Failed to update status");
  },

  /** POST /users/:userId/permissions */
  async updatePermission(
    userId: string,
    data: UpdatePermissionRequest,
  ): Promise<void> {
    const res = await api.post<ApiResponse<null>>(
      `/users/${userId}/permissions`,
      data,
    );

    if (res.data.success === false) {
      throw new Error(res.data.message || "Failed to update permission");
    }
  },

  /** GET /users/:userId/permissions */
  async getPermissions(userId: string): Promise<PermissionProfile> {
    const res = await api.get<ApiResponse<PermissionProfile>>(
      `/users/${userId}/permissions`,
    );
    return extractData(res.data, "Failed to load permissions");
  },

  /** DELETE /users/:userId */
  async deleteUser(userId: string): Promise<void> {
    const res = await api.delete<ApiResponse<null>>(`/users/${userId}`);

    if (res.data.success === false) {
      throw new Error(res.data.message || "Failed to delete user");
    }
  },
};
