"use client";

import { useState } from "react";
import { KeyRound, Shield, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { RoleBadge, StatusBadge } from "@/components/ui/Badge";
import { PermissionGroup } from "@/components/ui/PermissionCheckbox";
import { useUser, useAuthStore } from "@/store/authStore";
import { formatDateTime, formatRoleName, formatPhone } from "@/utils/format";
import { ALL_PERMISSIONS, ROLE_COLORS } from "@/utils/constants";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const user = useUser();
  const router = useRouter();
  const { changePassword } = useAuthStore();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ✅ FIXED TYPES
  const userPermSet: Set<string> = new Set(user?.permissions ?? []);

  const roleColor = user ? (ROLE_COLORS[user.role] ?? "#22c55e") : "#22c55e";

  // ✅ NO RED LINE HERE
  const initials =
    (user?.fullName ?? "")
      .split(" ")
      .map((n: string) => n.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const handleChangePassword = async () => {
    setError("");
    setSuccess(false);

    if (!oldPassword || !newPassword || !confirmPass) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPass) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        oldPassword,
        newPassword,
        confirmPassword: confirmPass,
      });

      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPass("");

      setTimeout(() => router.push("/login"), 2000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to change password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="rounded-xl border border-[#1f2d3d] bg-[#111827] p-6 flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center
              text-xl font-bold text-white shrink-0"
            style={{ backgroundColor: roleColor }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-100">
              {user?.fullName ?? "—"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {user && <RoleBadge role={user.role} />}
              {user && <StatusBadge status={user.status} />}
            </div>
          </div>

          <div className="hidden sm:grid grid-cols-2 gap-x-8 gap-y-1 text-right shrink-0">
            <div>
              <p className="text-[10px] text-gray-600 uppercase">Phone</p>
              <p className="text-xs text-gray-300">
                {formatPhone(user?.phone)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase">Role</p>
              <p className="text-xs text-gray-300">
                {user ? formatRoleName(user.role) : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase">Last Login</p>
              <p className="text-xs text-gray-300">
                {formatDateTime(user?.lastLoginAt)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase">Permissions</p>
              <p className="text-xs text-green-400 font-bold">
                {user?.permissions.length ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Change Password */}
          <Card
            title="Change Password"
            subtitle="You will be logged out after changing"
          >
            <div className="space-y-4">
              {success && (
                <Alert type="success" title="Password Changed">
                  Redirecting to login…
                </Alert>
              )}

              {error && (
                <Alert type="error" onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              <Input
                label="Current Password"
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                icon={<KeyRound size={14} />}
                iconEnd={
                  <button type="button" onClick={() => setShowOld((o) => !o)}>
                    {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
                required
              />

              <Input
                label="New Password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                hint="Minimum 8 characters"
                icon={<KeyRound size={14} />}
                iconEnd={
                  <button type="button" onClick={() => setShowNew((o) => !o)}>
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
                required
              />

              <Input
                label="Confirm New Password"
                type={showConfirm ? "text" : "password"}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                error={
                  confirmPass && newPassword !== confirmPass
                    ? "Passwords do not match"
                    : undefined
                }
                icon={<KeyRound size={14} />}
                iconEnd={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((o) => !o)}
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
                required
              />

              <Button
                fullWidth
                loading={loading}
                onClick={handleChangePassword}
                icon={<CheckCircle2 size={15} />}
              >
                Update Password
              </Button>
            </div>
          </Card>

          {/* Permissions */}
          <Card
            title="My Permissions"
            subtitle={`${user?.permissions.length ?? 0} permissions assigned`}
          >
            <div className="flex items-center gap-1.5 mb-4">
              <Shield size={13} className="text-gray-600" />
              <span className="text-xs text-gray-500">
                Role:{" "}
                <span className="text-gray-300 font-medium">
                  {user ? formatRoleName(user.role) : "—"}
                </span>
              </span>
            </div>

            <div className="max-h-[380px] overflow-y-auto pr-1">
              {Object.entries(ALL_PERMISSIONS).map(([category, perms]) => {
                const active = perms.filter((p) => userPermSet.has(p));
                if (active.length === 0) return null;

                return (
                  <PermissionGroup
                    key={category}
                    category={category}
                    permissions={active}
                    checkedSet={userPermSet}
                    disabledSet={new Set(active)}
                    onChange={() => {}}
                  />
                );
              })}

              {(!user || user.permissions.length === 0) && (
                <p className="text-sm text-gray-600 py-6 text-center">
                  No permissions assigned
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
