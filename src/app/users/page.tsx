// src/app/users/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, UserPlus, RefreshCw, Users } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

import { UsersTable } from "@/modules/users/components/UsersTable";
import { CreateUserModal } from "@/modules/users/components/CreateUserModal";
import { PermissionsModal } from "@/modules/users/components/PermissionsModal";

import { useUsersStore } from "@/store/usersStore";
import { useAuthStore } from "@/store/authStore";

import type { UserResponse, UsersFilters } from "@/types/user";
import type { UserRole, UserStatus } from "@/types/auth";
import { formatRoleName } from "@/utils/format";

const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "STATE_MANAGER", label: "State Manager" },
  { value: "DISTRICT_MANAGER", label: "District Manager" },
  { value: "BLOCK_MANAGER", label: "Block Manager" },
  { value: "HR_MANAGER", label: "HR Manager" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "PHARMACIST", label: "Pharmacist" },
  { value: "RECEPTIONIST", label: "Receptionist" },
  { value: "CENTER_STAFF", label: "Center Staff" },
  { value: "ASSOCIATE", label: "Associate" },
  { value: "FAMILY", label: "Family" },
  { value: "VENDOR", label: "Vendor" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "LOCKED", label: "Locked" },
  { value: "SUSPENDED", label: "Suspended" },
];

export default function UsersPage() {
  const {
    users,
    loading,
    error,
    fetchUsers,
    updateStatus,
    deleteUser,
    clearError,
  } = useUsersStore();

  const { hasPermission } = useAuthStore();

  const [filters, setFilters] = useState<UsersFilters>({
    search: "",
    role: "",
    status: "",
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [permissionsTarget, setPermissionsTarget] =
    useState<UserResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [statusTarget, setStatusTarget] = useState<UserResponse | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadUsers = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim();

    return users.filter((u) => {
      if (filters.role && u.role !== filters.role) return false;
      if (filters.status && u.status !== filters.status) return false;

      if (q) {
        const match =
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [users, filters]);

  const stats = useMemo(() => {
    let active = 0;
    let locked = 0;

    for (const u of users) {
      if (u.status === "ACTIVE") active++;
      if (u.status === "LOCKED") locked++;
    }

    return {
      total: users.length,
      active,
      inactive: users.length - active,
      locked,
    };
  }, [users]);

  const handleToggleStatus = async () => {
    if (!statusTarget) return;

    const nextStatus: UserStatus =
      statusTarget.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setActionLoading(true);
    setActionError("");

    try {
      await updateStatus(statusTarget.id, nextStatus);
      setStatusTarget(null);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to update status",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setActionLoading(true);
    setActionError("");

    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-gray-100">User Management</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage users within your geographic scope
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={loadUsers}
              loading={loading}
            >
              Refresh
            </Button>

            {hasPermission("USER_CREATE") && (
              <Button
                size="sm"
                icon={<UserPlus size={14} />}
                onClick={() => setCreateOpen(true)}
              >
                New User
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert type="error" onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total"
            value={stats.total}
            icon={<Users size={16} />}
            color="#3b82f6"
            loading={loading}
          />
          <StatCard
            label="Active"
            value={stats.active}
            color="#22c55e"
            loading={loading}
          />
          <StatCard
            label="Inactive"
            value={stats.inactive}
            color="#6b7280"
            loading={loading}
          />
          <StatCard
            label="Locked"
            value={stats.locked}
            color="#ef4444"
            loading={loading}
          />
        </div>

        {/* Filters */}
        <Card padding={false}>
          <div className="flex flex-col sm:flex-row gap-3 p-4">
            <div className="flex-1">
              <Input
                placeholder="Search name, email, phone…"
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    search: e.target.value,
                  }))
                }
                icon={<Search size={14} />}
              />
            </div>

            <div className="w-full sm:w-44">
              <Select
                options={ROLE_OPTIONS}
                value={filters.role}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    role: e.target.value as UserRole | "",
                  }))
                }
              />
            </div>

            <div className="w-full sm:w-40">
              <Select
                options={STATUS_OPTIONS}
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    status: e.target.value as UserStatus | "",
                  }))
                }
              />
            </div>

            {(filters.search || filters.role || filters.status) && (
              <Button
                variant="ghost"
                onClick={() => setFilters({ search: "", role: "", status: "" })}
              >
                Clear
              </Button>
            )}
          </div>

          {!loading && (
            <div className="px-4 pb-3">
              <span className="text-xs text-gray-600">
                Showing{" "}
                <span className="text-gray-400 font-medium">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="text-gray-400 font-medium">
                  {users.length}
                </span>{" "}
                users
              </span>
            </div>
          )}
        </Card>

        {/* Table */}
        <UsersTable
          users={filtered}
          loading={loading}
          onPermissions={setPermissionsTarget}
          onToggleStatus={setStatusTarget}
          onDelete={setDeleteTarget}
        />

        {/* Modals */}
        {createOpen && (
          <CreateUserModal open onClose={() => setCreateOpen(false)} />
        )}

        <PermissionsModal
          user={permissionsTarget}
          onClose={() => setPermissionsTarget(null)}
        />

        {/* Status Modal */}
        <Modal
          open={!!statusTarget}
          onClose={() => {
            setStatusTarget(null);
            setActionError("");
          }}
          title={
            statusTarget?.status === "ACTIVE"
              ? "Deactivate User"
              : "Activate User"
          }
          subtitle={statusTarget?.fullName}
          width={420}
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setStatusTarget(null);
                  setActionError("");
                }}
              >
                Cancel
              </Button>

              <Button
                variant={
                  statusTarget?.status === "ACTIVE" ? "danger" : "primary"
                }
                size="sm"
                loading={actionLoading}
                onClick={handleToggleStatus}
              >
                {statusTarget?.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </Button>
            </>
          }
        >
          {actionError && (
            <Alert type="error" className="mb-4">
              {actionError}
            </Alert>
          )}

          <p className="text-sm text-gray-400">
            {statusTarget?.status === "ACTIVE"
              ? `Deactivating ${statusTarget?.fullName} will immediately invalidate their session.`
              : `Activating ${statusTarget?.fullName} will allow them to log in again.`}
          </p>

          <div className="mt-3 p-3 rounded-lg bg-[#1a2332] border border-[#1f2d3d] space-y-1">
            <p className="text-xs text-gray-500">
              Role:{" "}
              <span className="text-gray-300">
                {statusTarget ? formatRoleName(statusTarget.role) : "—"}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Email:{" "}
              <span className="text-gray-300">{statusTarget?.email}</span>
            </p>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          open={!!deleteTarget}
          onClose={() => {
            setDeleteTarget(null);
            setActionError("");
          }}
          title="Delete User"
          subtitle="This action cannot be undone"
          width={420}
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDeleteTarget(null);
                  setActionError("");
                }}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                size="sm"
                loading={actionLoading}
                onClick={handleDelete}
              >
                Delete User
              </Button>
            </>
          }
        >
          {actionError && (
            <Alert type="error" className="mb-4">
              {actionError}
            </Alert>
          )}

          <Alert type="error" title="Warning">
            This is a permanent soft delete. The user&apos;s record and sessions
            will be removed.
          </Alert>

          <div className="mt-3 p-3 rounded-lg bg-[#1a2332] border border-[#1f2d3d] space-y-1">
            <p className="text-sm font-medium text-gray-200">
              {deleteTarget?.fullName}
            </p>
            <p className="text-xs text-gray-500">{deleteTarget?.email}</p>
            <p className="text-xs text-gray-500">
              Role: {deleteTarget ? formatRoleName(deleteTarget.role) : "—"}
            </p>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
