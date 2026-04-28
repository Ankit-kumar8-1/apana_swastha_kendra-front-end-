// src/components/ui/Card.tsx
"use client";

import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
}

export function Card({
  title,
  subtitle,
  actions,
  children,
  className,
  padding = true,
  hover = false,
}: CardProps) {
  const hasHeader = Boolean(title || actions);

  return (
    <section
      className={cn(
        "rounded-xl border border-[#1f2d3d] bg-[#111827]",
        hover && "transition-colors hover:border-[#2a3d52] hover:bg-[#131f2e]",
        className,
      )}
    >
      {hasHeader && (
        <div
          className={cn(
            "flex items-start justify-between gap-4 border-b border-[#1f2d3d]",
            padding ? "px-5 py-4" : "px-0 py-0",
          )}
        >
          <div className="min-w-0">
            {title && (
              <h3
                className="text-sm font-semibold text-gray-100 truncate"
                title={title}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className="text-xs text-gray-500 mt-0.5 truncate"
                title={subtitle}
              >
                {subtitle}
              </p>
            )}
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}

      <div className={padding ? "p-5" : ""}>{children}</div>
    </section>
  );
}

/* ================= FLAT CARD ================= */

export function FlatCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl bg-[#111827] border border-[#1f2d3d] p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
