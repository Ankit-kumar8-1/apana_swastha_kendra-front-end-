// src/components/ui/Alert.tsx
"use client";

import { type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/utils/cn";

type AlertType = "success" | "warning" | "error" | "info";

interface AlertProps {
  type: AlertType;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const alertConfig: Record<
  AlertType,
  {
    icon: ReactNode;
    border: string;
    bg: string;
    title: string;
    body: string;
  }
> = {
  success: {
    icon: <CheckCircle2 size={16} />,
    border: "border-green-500/30",
    bg: "bg-green-500/10",
    title: "text-green-300",
    body: "text-green-400/80",
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    title: "text-yellow-300",
    body: "text-yellow-400/80",
  },
  error: {
    icon: <XCircle size={16} />,
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    title: "text-red-300",
    body: "text-red-400/80",
  },
  info: {
    icon: <Info size={16} />,
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    title: "text-blue-300",
    body: "text-blue-400/80",
  },
};

export function Alert({
  type,
  title,
  children,
  onClose,
  className,
}: AlertProps) {
  const cfg = alertConfig[type];

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border p-3.5",
        cfg.border,
        cfg.bg,
        className,
      )}
    >
      {/* Icon */}
      <span className={cn("shrink-0 mt-0.5", cfg.title)} aria-hidden="true">
        {cfg.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn("text-sm font-semibold mb-0.5", cfg.title)}>
            {title}
          </p>
        )}
        <div className={cn("text-xs leading-relaxed", cfg.body)}>
          {children}
        </div>
      </div>

      {/* Close */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close alert"
          className={cn(
            "shrink-0 mt-0.5 rounded-md p-1 transition-opacity hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0a0f1a]",
            cfg.title,
          )}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
