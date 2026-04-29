"use client";

import { useEffect, useMemo, useState } from "react";
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

  const [permissionsTarget, setPermissionsTarget] =
    useState<UserResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [statusTarget, setStatusTarget] = useState<UserResponse | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return users.filter((u) => {
      if (filters.role && u.role !== filters.role) return false;
      if (filters.status && u.status !== filters.status) return false;
      if (
        q &&
        !(
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q)
        )
      )
        return false;
      return true;
    });
  }, [users, filters]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === "ACTIVE").length,
      inactive: users.filter((u) => u.status !== "ACTIVE").length,
      locked: users.filter((u) => u.status === "LOCKED").length,
    }),
    [users],
  );

  const handleToggleStatus = async () => {
    if (!statusTarget) return;

    const nextStatus: UserStatus =
      statusTarget.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setActionLoading(true);
    setActionError("");

    try {
      await updateStatus(statusTarget.id, nextStatus);
      setStatusTarget(null);
    } catch (e: unknown) {
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
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const canCreate = hasPermission("USER_CREATE");

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-100">User Management</h2>
            <p className="text-xs text-gray-500">Manage users</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={fetchUsers}
              loading={loading}
            >
              Refresh
            </Button>

            {canCreate && (
              <Button size="sm" icon={<UserPlus size={14} />}>
                New User
              </Button>
            )}
          </div>
        </div>

        {/* Error */}
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
          />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Inactive" value={stats.inactive} />
          <StatCard label="Locked" value={stats.locked} />
        </div>

        {/* Filters */}
        <Card padding={false}>
          <div className="flex gap-3 p-4 flex-wrap">
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
              icon={<Search size={14} />}
            />

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
        </Card>

        {/* Table */}
        <UsersTable
          users={filtered}
          loading={loading}
          onPermissions={setPermissionsTarget}
          onToggleStatus={setStatusTarget}
          onDelete={setDeleteTarget}
        />

        {/* Status Modal */}
        <Modal open={!!statusTarget} onClose={() => setStatusTarget(null)}>
          <Button onClick={handleToggleStatus} loading={actionLoading}>
            Confirm
          </Button>
        </Modal>

        {/* Delete Modal */}
        <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
          <Button onClick={handleDelete} loading={actionLoading}>
            Delete
          </Button>
        </Modal>

        {/* Permissions */}
        <Modal
          open={!!permissionsTarget}
          onClose={() => setPermissionsTarget(null)}
        >
          <div>
            {(permissionsTarget?.effectivePermissions ?? []).map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
