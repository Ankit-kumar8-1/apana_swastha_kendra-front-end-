// src/components/ui/PermissionCheckbox.tsx
"use client";

import { cn } from "@/utils/cn";
import { Check } from "lucide-react";

interface PermissionCheckboxProps {
  permission: string;
  checked: boolean;
  onChange: (permission: string, checked: boolean) => void;
  disabled?: boolean;
  reason?: string;
}

export function PermissionCheckbox({
  permission,
  checked,
  onChange,
  disabled = false,
  reason,
}: PermissionCheckboxProps) {
  const label = (permission ?? "")
    .toString()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return (
    <label
      title={disabled ? reason : undefined}
      className={cn(
        "flex items-center gap-2.5 py-1.5 px-2 rounded-lg select-none group",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:bg-[#1a2332]",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => {
          if (!disabled) onChange(permission, !checked);
        }}
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
          checked
            ? "bg-green-500 border-green-500"
            : "bg-transparent border-[#2a3d52] group-hover:border-green-500/50",
        )}
      >
        {checked && <Check size={10} strokeWidth={3} className="text-white" />}
      </button>

      <span className="text-xs text-gray-400 font-mono">{label}</span>
    </label>
  );
}

// Group renderer
interface PermissionGroupProps {
  category: string;
  permissions: string[];
  checkedSet: Set<string>;
  disabledSet?: Set<string>;
  onChange: (perm: string, checked: boolean) => void;
}

const EMPTY_SET = new Set<string>();

export function PermissionGroup({
  category,
  permissions,
  checkedSet,
  disabledSet,
  onChange,
}: PermissionGroupProps) {
  const disabled = disabledSet ?? EMPTY_SET;

  const allChecked = permissions.every((p) => checkedSet.has(p));
  const someChecked = permissions.some((p) => checkedSet.has(p));

  const toggleAll = () => {
    const next = !allChecked;

    permissions.forEach((p) => {
      if (!disabled.has(p)) {
        onChange(p, next);
      }
    });
  };

  const allDisabled = permissions.every((p) => disabled.has(p));

  return (
    <div className="mb-4">
      <div
        className={cn(
          "flex items-center gap-2 mb-1.5",
          allDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        )}
        onClick={() => {
          if (!allDisabled) toggleAll();
        }}
      >
        <div
          className={cn(
            "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
            allChecked
              ? "bg-green-500 border-green-500"
              : someChecked
                ? "bg-green-500/40 border-green-500/60"
                : "border-[#2a3d52]",
          )}
        >
          {(allChecked || someChecked) && (
            <Check size={10} strokeWidth={3} className="text-white" />
          )}
        </div>

        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
          {category}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5 pl-2">
        {permissions.map((perm) => (
          <PermissionCheckbox
            key={perm}
            permission={perm}
            checked={checkedSet.has(perm)}
            disabled={disabled.has(perm)}
            reason="You don't have this permission to grant"
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}
