// src/components/ui/Badge.tsx
"use client";

import { type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { ROLE_COLORS, STATUS_COLORS, ROLE_LABELS } from "@/utils/constants";
import type { UserRole, UserStatus } from "@/types/auth";

type BadgeVariant = "success" | "warning" | "error" | "info" | "default";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  color?: string;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<
  BadgeVariant,
  { bg: string; text: string; dot: string }
> = {
  success: {
    bg: "bg-green-500/15",
    text: "text-green-400",
    dot: "bg-green-400",
  },
  warning: {
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
  },
  error: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400" },
  info: { bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-400" },
  default: { bg: "bg-gray-500/15", text: "text-gray-400", dot: "bg-gray-400" },
};

export function Badge({
  children,
  variant = "default",
  color,
  dot,
  className,
}: BadgeProps) {
  // custom color mode
  if (color) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
          className,
        )}
        style={{ backgroundColor: `${color}20`, color }}
      >
        {dot && (
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        {children}
      </span>
    );
  }

  const styles = variantStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        styles.bg,
        styles.text,
        className,
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", styles.dot)} />
      )}
      {children}
    </span>
  );
}

/* ================= ROLE BADGE ================= */

export function RoleBadge({ role }: { role: UserRole | string }) {
  const safeRole = role as UserRole;

  const color = ROLE_COLORS[safeRole] ?? "#6b7280";
  const label =
    ROLE_LABELS[safeRole] ??
    role
      ?.toString()
      .split("_")
      .map((w: string) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ");

  return (
    <Badge color={color} dot>
      {label}
    </Badge>
  );
}

/* ================= STATUS BADGE ================= */

export function StatusBadge({ status }: { status: UserStatus | string }) {
  const safeStatus = status as UserStatus;

  const variantMap: Record<UserStatus, BadgeVariant> = {
    ACTIVE: "success",
    INACTIVE: "default",
    LOCKED: "error",
    SUSPENDED: "warning",
  };

  const label = safeStatus.charAt(0) + safeStatus.slice(1).toLowerCase();

  return (
    <Badge variant={variantMap[safeStatus] ?? "default"} dot>
      {label}
    </Badge>
  );
}
