// src/modules/geography/api/geographyApi.ts

import api from "@/lib/axios";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/api";
import type {
  StateResponse,
  DistrictResponse,
  BlockResponse,
  CenterResponse,
  GeographyTree,
  CreateStateRequest,
  CreateDistrictRequest,
  CreateBlockRequest,
  CreateCenterRequest,
} from "@/types/geography";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function extractData<T>(res: ApiResponse<T> | undefined, fallback: T): T {
  return res?.data ?? fallback;
}

function ensureData<T>(
  res: ApiResponse<T> | undefined,
  errorMessage: string,
): T {
  if (!res?.data) {
    throw new Error(errorMessage);
  }
  return res.data;
}

function handleError(error: unknown): never {
  const err = error as AxiosError<{ message?: string }>;
  const message =
    err?.response?.data?.message || err?.message || "Something went wrong";
  throw new Error(message);
}

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────

export const geographyApi = {
  /** GET /geography/tree */
  getTree: async (): Promise<GeographyTree> => {
    try {
      const res = await api.get<ApiResponse<GeographyTree>>("/geography/tree");
      return extractData(res.data, { states: [] });
    } catch (error) {
      handleError(error);
    }
  },

  /** GET /geography/states */
  getStates: async (): Promise<StateResponse[]> => {
    try {
      const res =
        await api.get<ApiResponse<StateResponse[]>>("/geography/states");
      return extractData(res.data, []);
    } catch (error) {
      handleError(error);
    }
  },

  /** POST /geography/states */
  createState: async (data: CreateStateRequest): Promise<StateResponse> => {
    try {
      const res = await api.post<ApiResponse<StateResponse>>(
        "/geography/states",
        data,
      );
      return ensureData(res.data, "Failed to create state");
    } catch (error) {
      handleError(error);
    }
  },

  /** GET /geography/states/:stateId/districts */
  getDistricts: async (stateId: string): Promise<DistrictResponse[]> => {
    try {
      if (!stateId) return [];
      const res = await api.get<ApiResponse<DistrictResponse[]>>(
        `/geography/states/${stateId}/districts`,
      );
      return extractData(res.data, []);
    } catch (error) {
      handleError(error);
    }
  },

  /** POST /geography/districts */
  createDistrict: async (
    data: CreateDistrictRequest,
  ): Promise<DistrictResponse> => {
    try {
      const res = await api.post<ApiResponse<DistrictResponse>>(
        "/geography/districts",
        data,
      );
      return ensureData(res.data, "Failed to create district");
    } catch (error) {
      handleError(error);
    }
  },

  /** GET /geography/districts/:districtId/blocks */
  getBlocks: async (districtId: string): Promise<BlockResponse[]> => {
    try {
      if (!districtId) return [];
      const res = await api.get<ApiResponse<BlockResponse[]>>(
        `/geography/districts/${districtId}/blocks`,
      );
      return extractData(res.data, []);
    } catch (error) {
      handleError(error);
    }
  },

  /** POST /geography/blocks */
  createBlock: async (data: CreateBlockRequest): Promise<BlockResponse> => {
    try {
      const res = await api.post<ApiResponse<BlockResponse>>(
        "/geography/blocks",
        data,
      );
      return ensureData(res.data, "Failed to create block");
    } catch (error) {
      handleError(error);
    }
  },

  /** GET /geography/blocks/:blockId/centers */
  getCenters: async (blockId: string): Promise<CenterResponse[]> => {
    try {
      if (!blockId) return [];
      const res = await api.get<ApiResponse<CenterResponse[]>>(
        `/geography/blocks/${blockId}/centers`,
      );
      return extractData(res.data, []);
    } catch (error) {
      handleError(error);
    }
  },

  /** POST /geography/centers */
  createCenter: async (data: CreateCenterRequest): Promise<CenterResponse> => {
    try {
      const res = await api.post<ApiResponse<CenterResponse>>(
        "/geography/centers",
        data,
      );
      return ensureData(res.data, "Failed to create center");
    } catch (error) {
      handleError(error);
    }
  },

  /** GET /geography/centers/:centerId */
  getCenter: async (centerId: string): Promise<CenterResponse> => {
    try {
      if (!centerId) {
        throw new Error("Center ID is required");
      }
      const res = await api.get<ApiResponse<CenterResponse>>(
        `/geography/centers/${centerId}`,
      );
      return ensureData(res.data, "Center not found");
    } catch (error) {
      handleError(error);
    }
  },
};
