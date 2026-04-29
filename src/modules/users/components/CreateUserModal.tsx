// src/modules/users/components/CreateUserModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  ChevronRight,
  Copy,
  CheckCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { PermissionGroup } from "@/components/ui/PermissionCheckbox";
import { useUsersStore } from "@/store/usersStore";
import { useGeographyStore } from "@/store/geographyStore";
import { useUser } from "@/store/authStore";
import {
  getCreatableRoles,
  filterGrantablePermissions,
} from "@/utils/permissions";
import { formatRoleName } from "@/utils/format";
import { ALL_PERMISSIONS, GEOGRAPHY_REQUIRED_BY_ROLE } from "@/utils/constants";
import type { UserRole } from "@/types/auth";
import type { CreateUserRequest } from "@/types/user";
import { cn } from "@/utils/cn";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole | "";
  stateId: string;
  districtId: string;
  blockId: string;
  centerId: string;
}

const EMPTY_FORM: FormData = {
  fullName: "",
  email: "",
  phone: "",
  role: "",
  stateId: "",
  districtId: "",
  blockId: "",
  centerId: "",
};

// ─────────────────────────────────────────────
// Step Indicator
// ─────────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              step === n
                ? "bg-green-500 text-white"
                : step > n
                  ? "bg-green-500/30 text-green-400"
                  : "bg-[#1a2332] text-gray-600",
            )}
          >
            {n}
          </div>
          <span
            className={cn(
              "text-xs",
              step === n ? "text-gray-200 font-medium" : "text-gray-600",
            )}
          >
            {n === 1 ? "Basic Info" : "Permissions"}
          </span>
          {n < 2 && <ChevronRight size={13} className="text-gray-700" />}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Temp Password
// ─────────────────────────────────────────────
function TempPasswordDisplay({
  password,
  onClose,
}: {
  password: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert type="warning" title="Save this password now">
        This temporary password will <strong>never be shown again</strong>.
      </Alert>

      <div className="rounded-xl border-2 border-yellow-500/40 bg-yellow-500/5 p-4">
        <p className="text-xs text-yellow-500/80 mb-2 font-medium uppercase tracking-wide">
          Temporary Password
        </p>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-lg font-bold text-yellow-300 font-mono tracking-widest">
            {visible ? password : "•".repeat(password.length)}
          </code>

          <button onClick={() => setVisible((v) => !v)}>
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          <Button
            size="sm"
            variant="outline"
            icon={copied ? <CheckCheck size={13} /> : <Copy size={13} />}
            onClick={copy}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      <Button fullWidth onClick={onClose}>
        Done
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const currentUser = useUser();
  const { createUser } = useUsersStore();
  const {
    states,
    districts,
    blocks,
    centers,
    fetchStates,
    fetchDistricts,
    fetchBlocks,
    fetchCenters,
    clearCascade,
  } = useGeographyStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [useDefaults, setUseDefaults] = useState(true);
  const [customPerms, setCustomPerms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  useEffect(() => {
    if (open) fetchStates();
  }, [open, fetchStates]);

  const handleClose = () => {
    setStep(1);
    setForm(EMPTY_FORM);
    setErrors({});
    setUseDefaults(true);
    setCustomPerms(new Set());
    setApiError("");
    setTempPassword(null);
    clearCascade();
    onClose();
  };

  const setField = (key: keyof FormData, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  // Memoized derived data
  const requiredGeo = useMemo(
    () => (form.role ? (GEOGRAPHY_REQUIRED_BY_ROLE[form.role] ?? []) : []),
    [form.role],
  );

  const creatableRoles = useMemo(
    () =>
      currentUser
        ? getCreatableRoles(currentUser.role).map((r) => ({
            value: r,
            label: formatRoleName(r),
          }))
        : [],
    [currentUser],
  );

  const grantablePermsSet = useMemo(
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

  const validateStep1 = (): boolean => {
    const errs: Partial<FormData> = {};

    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (!form.role) errs.role = "Role is required" as never;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setApiError("");
    setLoading(true);

    try {
      const payload: CreateUserRequest = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role: form.role as UserRole,
        stateId: form.stateId || null,
        districtId: form.districtId || null,
        blockId: form.blockId || null,
        centerId: form.centerId || null,
        customPermissions: useDefaults ? null : Array.from(customPerms),
      };

      const created = await createUser(payload);

      if (created?.tempPassword) {
        setTempPassword(created.tempPassword);
      } else {
        handleClose();
      }
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  if (tempPassword) {
    return (
      <Modal open={open} onClose={handleClose} title="User Created" width={480}>
        <TempPasswordDisplay password={tempPassword} onClose={handleClose} />
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create New User"
      width={560}
    >
      <StepIndicator step={step} />

      {apiError && (
        <Alert type="error" className="mb-4" onClose={() => setApiError("")}>
          {apiError}
        </Alert>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            error={errors.fullName}
            icon={<User size={14} />}
            required
          />

          <Input
            label="Email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            error={errors.email}
            icon={<Mail size={14} />}
            required
          />

          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) =>
              setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            error={errors.phone}
            icon={<Phone size={14} />}
            required
          />
        </div>
      )}
    </Modal>
  );
}
