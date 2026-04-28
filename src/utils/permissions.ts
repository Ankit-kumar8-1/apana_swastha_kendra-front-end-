import { ROLE_LEVELS } from "./constants";
import type { UserRole } from "@/types/auth";

/* ================= ROLE LEVEL ================= */

/**
 * Get numeric level of role
 */
export function getRoleLevel(
  role: UserRole | string | null | undefined,
): number {
  if (!role) return 0;
  return ROLE_LEVELS[role as UserRole] ?? 0;
}

/* ================= ROLE CREATION ================= */

/**
 * Check if creator can create target role
 * Rule: creatorLevel > targetLevel
 */
export function canCreateRole(
  creatorRole: UserRole | string | null | undefined,
  targetRole: UserRole | string | null | undefined,
): boolean {
  return getRoleLevel(creatorRole) > getRoleLevel(targetRole);
}

/**
 * Get list of roles that creator can create
 */
export function getCreatableRoles(
  creatorRole: UserRole | string | null | undefined,
): UserRole[] {
  const creatorLevel = getRoleLevel(creatorRole);

  return (Object.entries(ROLE_LEVELS) as [UserRole, number][])
    .filter(([, level]) => level < creatorLevel)
    .map(([role]) => role);
}

/* ================= USER MANAGEMENT ================= */

/**
 * Check if manager can manage target user
 * Same rule as creation (strictly higher)
 */
export function canManageUser(
  managerRole: UserRole | string | null | undefined,
  targetRole: UserRole | string | null | undefined,
): boolean {
  return getRoleLevel(managerRole) > getRoleLevel(targetRole);
}

/**
 * Check if roleA is higher or equal to roleB
 */
export function isHigherOrEqual(
  roleA: UserRole | string | null | undefined,
  roleB: UserRole | string | null | undefined,
): boolean {
  return getRoleLevel(roleA) >= getRoleLevel(roleB);
}

/* ================= PERMISSIONS ================= */

/**
 * Filter only permissions that admin can grant
 */
export function filterGrantablePermissions(
  adminPermissions: string[] | null | undefined,
  allPermissions: string[] | null | undefined,
): string[] {
  if (!adminPermissions?.length || !allPermissions?.length) return [];

  const adminSet = new Set(adminPermissions);
  return allPermissions.filter((p) => adminSet.has(p));
}
