// src/modules/users/components/PermissionsModal.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Shield, RefreshCw, Info } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { PermissionGroup } from "@/components/ui/PermissionCheckbox";
import { RoleBadge } from "@/components/ui/Badge";
import { useUsersStore } from "@/store/usersStore";
import { useUser } from "@/store/authStore";
import { canManageUser, filterGrantablePermissions } from "@/utils/permissions";
import { ALL_PERMISSIONS } from "@/utils/constants";
import type { UserResponse, PermissionProfile } from "@/types/user";
import { cn } from "@/utils/cn";

type ActiveTab = "effective" | "default" | "additional" | "revoked";

interface PermissionsModalProps {
  user: UserResponse | null;
  onClose: () => void;
}

const TAB_LABELS: Record<ActiveTab, string> = {
  effective: "Effective",
  default: "Default",
  additional: "Added",
  revoked: "Revoked",
};

export function PermissionsModal({ user, onClose }: PermissionsModalProps) {
  const currentUser = useUser();
  const { getPermissions, updatePermission } = useUsersStore();

  const [profile, setProfile] = useState<PermissionProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("effective");

  const canEdit = useMemo(
    () =>
      !!(
        currentUser &&
        user &&
        canManageUser(currentUser.role, user.role) &&
        currentUser.id !== user.id
      ),
    [currentUser, user],
  );

  const grantableSet = useMemo(
    () =>
      new Set(
        currentUser
          ? filterGrantablePermissions(
              currentUser.permissions,
              Object.values(ALL_PERMISSIONS).flat(),
            )
          : [],
      ),
    [currentUser],
  );

  const load = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const data = await getPermissions(user.id);
      setProfile(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load permissions");
    } finally {
      setLoading(false);
    }
  }, [user?.id, getPermissions]);

  useEffect(() => {
    if (user?.id) {
      setProfile(null);
      setActiveTab("effective");
      load();
    }
  }, [user?.id, load]);

  const handleToggle = async (perm: string, checked: boolean) => {
    if (!user || !canEdit) return;

    setSaving(perm);
    setError("");

    try {
      await updatePermission(user.id, perm, checked);
      const fresh = await getPermissions(user.id);
      setProfile(fresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update permission");
    } finally {
      setSaving(null);
    }
  };

  if (!user) return null;

  const effectiveSet = useMemo(
    () => new Set(profile?.effectivePermissions ?? []),
    [profile],
  );

  const additionalSet = useMemo(
    () => new Set(profile?.additionalPermissions ?? []),
    [profile],
  );

  const revokedSet = useMemo(
    () => new Set(profile?.revokedPermissions ?? []),
    [profile],
  );

  const defaultSet = useMemo(
    () => new Set(profile?.defaultPermissions ?? []),
    [profile],
  );

  const disabledSet = useMemo(
    () =>
      new Set(
        Object.values(ALL_PERMISSIONS)
          .flat()
          .filter((p) => !grantableSet.has(p)),
      ),
    [grantableSet],
  );

  const tabCounts: Record<ActiveTab, number> = {
    effective: profile?.effectivePermissions?.length ?? 0,
    default: profile?.defaultPermissions?.length ?? 0,
    additional: profile?.additionalPermissions?.length ?? 0,
    revoked: profile?.revokedPermissions?.length ?? 0,
  };

  const renderPills = (set: Set<string>) => {
    const perms = Array.from(set);

    if (perms.length === 0) {
      return <p className="text-sm text-gray-600 py-6 text-center">None</p>;
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {perms.map((p) => (
          <span
            key={p}
            className="text-[10px] font-mono bg-[#1a2332] text-gray-400
              border border-[#1f2d3d] rounded px-1.5 py-0.5"
          >
            {p}
          </span>
        ))}
      </div>
    );
  };

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title="Permissions"
      subtitle={user.fullName}
      width={600}
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      {/* User info */}
      <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-[#0d1520] border border-[#1f2d3d]">
        <Shield size={16} className="text-green-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-200 truncate">
            {user.fullName}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
        <RoleBadge role={user.role} />

        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={13} />}
            onClick={load}
            loading={loading}
          />
        )}
      </div>

      {error && (
        <Alert type="error" className="mb-4" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {!canEdit && (
        <Alert type="info" className="mb-4">
          <div className="flex items-center gap-1.5">
            <Info size={12} />
            View only — you cannot modify permissions.
          </div>
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#1f2d3d] mb-4 overflow-x-auto">
        {(Object.keys(TAB_LABELS) as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2",
              activeTab === tab
                ? "border-green-500 text-green-400"
                : "border-transparent text-gray-600 hover:text-gray-400",
            )}
          >
            {TAB_LABELS[tab]}
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a2332]">
              {loading ? "…" : tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="max-h-[380px] overflow-y-auto pr-1">
          {activeTab === "effective" && (
            <div>
              {Object.entries(ALL_PERMISSIONS).map(([category, perms]) => (
                <PermissionGroup
                  key={category}
                  category={category}
                  permissions={perms}
                  checkedSet={effectiveSet}
                  disabledSet={canEdit ? disabledSet : new Set(perms)}
                  onChange={handleToggle}
                />
              ))}
            </div>
          )}

          {activeTab === "default" && renderPills(defaultSet)}
          {activeTab === "additional" && renderPills(additionalSet)}
          {activeTab === "revoked" && renderPills(revokedSet)}

          {saving && (
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <Spinner size="sm" />
              Updating {saving}…
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
