// src/types/geography.ts

// Common reusable types
export type UUID = string;

export type ActiveStatus = "ACTIVE" | "INACTIVE";

// ─────────────────────────────────────────────
// Base Interfaces (to reduce duplication)
// ─────────────────────────────────────────────

interface BaseEntity {
  id: UUID;
  name: string;
  code: string;
  active: boolean;
}

type NamedWithParent<
  TParentId extends string,
  TParentName extends string,
> = BaseEntity & Record<TParentId, UUID> & Record<TParentName, string>;

// ─────────────────────────────────────────────
// Response Types
// ─────────────────────────────────────────────

export interface StateResponse extends BaseEntity {}

export interface DistrictResponse extends NamedWithParent<
  "stateId",
  "stateName"
> {}

export interface BlockResponse extends NamedWithParent<
  "districtId",
  "districtName"
> {}

export interface CenterResponse {
  id: UUID;
  blockId: UUID;
  blockName: string;
  name: string;
  centerCode: string;
  address: string | null;
  phone: string | null;
  status: ActiveStatus;
  lat: number | null;
  lng: number | null;
}

// ─────────────────────────────────────────────
// Tree Structure Types
// ─────────────────────────────────────────────

export interface BlockNode extends BlockResponse {
  centersCount: number;
}

export interface DistrictNode extends DistrictResponse {
  blocks: BlockNode[];
}

export interface StateNode extends StateResponse {
  districts: DistrictNode[];
}

export interface GeographyTree {
  states: StateNode[];
}

// ─────────────────────────────────────────────
// Request Types
// ─────────────────────────────────────────────

export interface CreateStateRequest {
  name: string;
  code: string;
}

export interface CreateDistrictRequest {
  stateId: UUID;
  name: string;
  code: string;
}

export interface CreateBlockRequest {
  districtId: UUID;
  name: string;
  code: string;
}

export interface CreateCenterRequest {
  blockId: UUID;
  name: string;
  address?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

// ─────────────────────────────────────────────
// Utility Types (Optional but useful)
// ─────────────────────────────────────────────

// For partial updates (future-safe, not changing behavior)
export type UpdateStateRequest = Partial<CreateStateRequest>;
export type UpdateDistrictRequest = Partial<CreateDistrictRequest>;
export type UpdateBlockRequest = Partial<CreateBlockRequest>;
export type UpdateCenterRequest = Partial<CreateCenterRequest>;
