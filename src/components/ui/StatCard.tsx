// src/components/ui/StatCard.tsx
"use client";

import { type ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  color = "#22c55e",
  trend,
  trendUp,
  subtitle,
  loading = false,
  className,
}: StatCardProps) {
  const safeColor = color || "#22c55e";
  const showTrend = typeof trend === "string" && trend.length > 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-[#1f2d3d] bg-[#111827] p-5",
        "hover:border-[#2a3d52] transition-colors",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
            {label}
          </p>

          {loading ? (
            <div className="mt-2 h-7 w-24 rounded bg-[#1a2332] animate-pulse" />
          ) : (
            <p className="mt-1.5 text-2xl font-bold text-gray-100 tabular-nums">
              {value ?? "—"}
            </p>
          )}

          {subtitle && !loading && (
            <p className="mt-1 text-xs text-gray-500 truncate">{subtitle}</p>
          )}

          {showTrend && !loading && (
            <div
              className={cn(
                "mt-2 inline-flex items-center gap-1 text-xs font-medium",
                trendUp === false ? "text-red-400" : "text-green-400",
              )}
            >
              {trendUp === false ? (
                <TrendingDown size={12} />
              ) : (
                <TrendingUp size={12} />
              )}
              {trend}
            </div>
          )}
        </div>

        {icon && (
          <div
            className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `${safeColor}20`,
              color: safeColor,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
