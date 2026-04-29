// src/store/geographyStore.ts

import { create } from "zustand";
import { geographyApi } from "@/modules/geography/api/geographyApi";
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

interface GeographyState {
  tree: GeographyTree | null;
  states: StateResponse[];
  loading: boolean;
  error: string | null;

  districts: DistrictResponse[];
  blocks: BlockResponse[];
  centers: CenterResponse[];

  fetchTree: () => Promise<void>;
  fetchStates: () => Promise<void>;
  fetchDistricts: (stateId: string) => Promise<void>;
  fetchBlocks: (districtId: string) => Promise<void>;
  fetchCenters: (blockId: string) => Promise<void>;

  createState: (data: CreateStateRequest) => Promise<StateResponse>;
  createDistrict: (data: CreateDistrictRequest) => Promise<DistrictResponse>;
  createBlock: (data: CreateBlockRequest) => Promise<BlockResponse>;
  createCenter: (data: CreateCenterRequest) => Promise<CenterResponse>;

  clearCascade: () => void;
  clearError: () => void;
}

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────

const getErrorMessage = (e: unknown, fallback: string) =>
  e instanceof Error ? e.message : fallback;

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

export const useGeographyStore = create<GeographyState>((set, get) => ({
  tree: null,
  states: [],
  districts: [],
  blocks: [],
  centers: [],
  loading: false,
  error: null,

  fetchTree: async () => {
    set({ loading: true, error: null });
    try {
      const tree = await geographyApi.getTree();
      set({ tree, loading: false });
    } catch (e) {
      const msg = getErrorMessage(e, "Failed to load geography");
      set({ loading: false, error: msg });
      throw e;
    }
  },

  fetchStates: async () => {
    set({ loading: true, error: null });
    try {
      const states = await geographyApi.getStates();
      set({ states, loading: false });
    } catch (e) {
      const msg = getErrorMessage(e, "Failed to load states");
      set({ loading: false, error: msg });
      throw e;
    }
  },

  fetchDistricts: async (stateId) => {
    // reset cascade safely
    set({ districts: [], blocks: [], centers: [] });

    if (!stateId) return;

    try {
      const districts = await geographyApi.getDistricts(stateId);
      set({ districts });
    } catch {
      set({ districts: [] });
    }
  },

  fetchBlocks: async (districtId) => {
    set({ blocks: [], centers: [] });

    if (!districtId) return;

    try {
      const blocks = await geographyApi.getBlocks(districtId);
      set({ blocks });
    } catch {
      set({ blocks: [] });
    }
  },

  fetchCenters: async (blockId) => {
    set({ centers: [] });

    if (!blockId) return;

    try {
      const centers = await geographyApi.getCenters(blockId);
      set({ centers });
    } catch {
      set({ centers: [] });
    }
  },

  createState: async (data) => {
    const created = await geographyApi.createState(data);

    set((s) => ({
      states: [...s.states, created],
      tree: s.tree
        ? {
            states: [...s.tree.states, { ...created, districts: [] }],
          }
        : s.tree,
    }));

    return created;
  },

  createDistrict: async (data) => {
    const created = await geographyApi.createDistrict(data);

    set((s) => ({
      districts: [...s.districts, created],
    }));

    return created;
  },

  createBlock: async (data) => {
    const created = await geographyApi.createBlock(data);

    set((s) => ({
      blocks: [...s.blocks, created],
    }));

    return created;
  },

  createCenter: async (data) => {
    const created = await geographyApi.createCenter(data);

    set((s) => ({
      centers: [...s.centers, created],
    }));

    return created;
  },

  clearCascade: () =>
    set({
      districts: [],
      blocks: [],
      centers: [],
    }),

  clearError: () => set({ error: null }),
}));
