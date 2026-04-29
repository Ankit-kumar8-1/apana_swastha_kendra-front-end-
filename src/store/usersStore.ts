// src/store/usersStore.ts

import { create } from "zustand";
import { usersApi } from "@/modules/users/api/usersApi";
import type {
  UserResponse,
  CreateUserRequest,
  PermissionProfile,
} from "@/types/user";
import type { UserStatus } from "@/types/auth";

interface UsersState {
  users: UserResponse[];
  loading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  createUser: (data: CreateUserRequest) => Promise<UserResponse>;
  updateStatus: (
    userId: string,
    status: UserStatus,
    reason?: string,
  ) => Promise<void>;
  updatePermission: (
    userId: string,
    permission: string,
    granted: boolean,
    reason?: string,
  ) => Promise<void>;
  getPermissions: (userId: string) => Promise<PermissionProfile>;
  deleteUser: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await usersApi.getUsers();
      set({ users });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load users";
      set({ error: msg });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  createUser: async (data) => {
    set({ loading: true, error: null });
    try {
      const newUser = await usersApi.createUser(data);
      set((state) => ({
        users: [newUser, ...state.users],
      }));
      return newUser;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create user";
      set({ error: msg });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateStatus: async (userId, status, reason) => {
    set({ loading: true, error: null });
    try {
      const updated = await usersApi.updateStatus(userId, { status, reason });
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? updated : u)),
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to update status";
      set({ error: msg });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updatePermission: async (userId, permission, granted, reason) => {
    set({ loading: true, error: null });

    try {
      await usersApi.updatePermission(userId, { permission, granted, reason });

      // Optimistic update instead of extra API call
      set((state) => ({
        users: state.users.map((u) => {
          if (u.id !== userId) return u;

          const perms = new Set(u.effectivePermissions ?? []);

          if (granted) perms.add(permission);
          else perms.delete(permission);

          return {
            ...u,
            effectivePermissions: Array.from(perms),
          };
        }),
      }));
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Failed to update permission";
      set({ error: msg });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  getPermissions: async (userId) => {
    set({ error: null });
    try {
      return await usersApi.getPermissions(userId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load permissions";
      set({ error: msg });
      throw e;
    }
  },

  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await usersApi.deleteUser(userId);
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to delete user";
      set({ error: msg });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
