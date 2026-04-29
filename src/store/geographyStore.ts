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
  StateNode,
} from "@/types/geography";

interface GeographyState {
  tree: GeographyTree | null;
  states: StateResponse[];
  districts: DistrictResponse[];
  blocks: BlockResponse[];
  centers: CenterResponse[];
  loading: boolean;
  error: string | null;

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
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Failed to load geography",
      });
    }
  },

  fetchStates: async () => {
    set({ loading: true, error: null });
    try {
      const states = await geographyApi.getStates();
      set({ states, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Failed to load states",
      });
    }
  },

  fetchDistricts: async (stateId) => {
    set({ districts: [], blocks: [], centers: [] });
    try {
      const districts = await geographyApi.getDistricts(stateId);
      set({ districts });
    } catch {
      set({ districts: [] });
    }
  },

  fetchBlocks: async (districtId) => {
    set({ blocks: [], centers: [] });
    try {
      const blocks = await geographyApi.getBlocks(districtId);
      set({ blocks });
    } catch {
      set({ blocks: [] });
    }
  },

  fetchCenters: async (blockId) => {
    set({ centers: [] });
    try {
      const centers = await geographyApi.getCenters(blockId);
      set({ centers });
    } catch {
      set({ centers: [] });
    }
  },

  createState: async (data) => {
    const created = await geographyApi.createState(data);

    set((s) => {
      const newStateNode: StateNode = {
        ...created,
        districts: [],
      };

      return {
        states: [...s.states, created],
        tree: s.tree ? { states: [...s.tree.states, newStateNode] } : s.tree,
      };
    });

    return created;
  },

  createDistrict: async (data) => {
    const created = await geographyApi.createDistrict(data);
    set((s) => ({ districts: [...s.districts, created] }));
    return created;
  },

  createBlock: async (data) => {
    const created = await geographyApi.createBlock(data);
    set((s) => ({ blocks: [...s.blocks, created] }));
    return created;
  },

  createCenter: async (data) => {
    const created = await geographyApi.createCenter(data);
    set((s) => ({ centers: [...s.centers, created] }));
    return created;
  },

  clearCascade: () => set({ districts: [], blocks: [], centers: [] }),
  clearError: () => set({ error: null }),
}));
