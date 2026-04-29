// src/components/ui/Spinner.tsx
"use client";

import { cn } from "@/utils/cn";

type SpinnerSize = "sm" | "md" | "lg" | "xl";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <svg
      role="status"
      aria-label="Loading"
      className={cn("animate-spin text-green-500", sizeMap[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

/* ================= FULL PAGE SPINNER ================= */

interface FullPageSpinnerProps {
  label?: string;
}

export function FullPageSpinner({ label = "Loading…" }: FullPageSpinnerProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1a]"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-sm text-gray-500 animate-pulse">{label}</p>
      </div>
    </div>
  );
}
