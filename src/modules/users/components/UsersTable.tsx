// src/modules/users/components/UsersTable.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Shield,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import { Table, type TableColumn } from "@/components/ui/Table";
import { RoleBadge, StatusBadge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import { formatRelativeTime, formatPhone } from "@/utils/format";
import { ROLE_COLORS } from "@/utils/constants";
import { useAuthStore } from "@/store/authStore";
import { canManageUser } from "@/utils/permissions";
import type { UserResponse } from "@/types/user";

interface UsersTableProps {
  users: UserResponse[];
  loading: boolean;
  onPermissions: (user: UserResponse) => void;
  onToggleStatus: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
}

function UserAvatar({ user }: { user: UserResponse }) {
  const color = ROLE_COLORS[user.role] ?? "#6b7280";

  const initials =
    user.fullName
      ?.split(" ")
      .map((n: string) => n?.[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center
          text-xs font-bold text-white shrink-0"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-200 truncate">
          {user.fullName}
        </p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </div>
    </div>
  );
}

function ActionMenu({
  user,
  onPermissions,
  onToggleStatus,
  onDelete,
  canManage,
}: {
  user: UserResponse;
  onPermissions: (u: UserResponse) => void;
  onToggleStatus: (u: UserResponse) => void;
  onDelete: (u: UserResponse) => void;
  canManage: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isActive = user.status === "ACTIVE";

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-lg flex items-center justify-center
          text-gray-600 hover:text-gray-300 hover:bg-[#1a2332] transition-colors"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1 w-48 bg-[#111827] border
          border-[#1f2d3d] rounded-xl shadow-2xl z-20 py-1 overflow-hidden"
        >
          <button
            onClick={() => {
              onPermissions(user);
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm
              text-gray-400 hover:text-gray-200 hover:bg-[#1a2332] transition-colors"
          >
            <Shield size={14} />
            View Permissions
          </button>

          {canManage && (
            <>
              <button
                onClick={() => {
                  onToggleStatus(user);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "text-yellow-400 hover:bg-yellow-500/10"
                    : "text-green-400 hover:bg-green-500/10",
                )}
              >
                {isActive ? (
                  <ToggleLeft size={14} />
                ) : (
                  <ToggleRight size={14} />
                )}
                {isActive ? "Deactivate" : "Activate"}
              </button>

              <div className="border-t border-[#1f2d3d] my-1" />

              <button
                onClick={() => {
                  onDelete(user);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm
                  text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} />
                Delete User
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function UsersTable({
  users,
  loading,
  onPermissions,
  onToggleStatus,
  onDelete,
}: UsersTableProps) {
  const { user: currentUser } = useAuthStore();

  const columns: TableColumn<UserResponse>[] = [
    {
      key: "fullName",
      title: "User",
      render: (_, row) => <UserAvatar user={row} />,
    },
    {
      key: "phone",
      title: "Phone",
      render: (_, row) => (
        <span className="text-sm text-gray-400 font-mono">
          {formatPhone(row.phone)}
        </span>
      ),
    },
    {
      key: "role",
      title: "Role",
      render: (_, row) => <RoleBadge role={row.role} />,
    },
    {
      key: "status",
      title: "Status",
      render: (_, row) => <StatusBadge status={row.status} />,
    },
    {
      key: "effectivePermissions",
      title: "Perms",
      align: "center",
      width: 72,
      render: (_, row) => (
        <span className="text-xs text-gray-500 tabular-nums">
          {Array.isArray(row.effectivePermissions)
            ? row.effectivePermissions.length
            : 0}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      render: (_, row) => (
        <span className="text-xs text-gray-600">
          {formatRelativeTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      title: "",
      align: "right",
      width: 56,
      render: (_, row) => {
        const canManage = currentUser
          ? canManageUser(currentUser.role, row.role) &&
            currentUser.id !== row.id
          : false;

        return (
          <ActionMenu
            user={row}
            onPermissions={onPermissions}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            canManage={canManage}
          />
        );
      },
    },
  ];

  return (
    <Table<UserResponse>
      columns={columns}
      data={users}
      loading={loading}
      rowKey={(row) => row.id}
      emptyMessage="No users found matching your filters"
    />
  );
}
