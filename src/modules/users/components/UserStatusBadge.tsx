// src/modules/users/components/UserStatusBadge.tsx
"use client";

import { StatusBadge } from "@/components/ui/Badge";
import type { UserStatus } from "@/types/auth";

interface UserStatusBadgeProps {
  status: UserStatus | null | undefined;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  if (!status) return null;

  return <StatusBadge status={status} />;
}
