// src/components/ui/Table.tsx
"use client";

import { type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Spinner } from "./Spinner";

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  title: string;
  width?: string | number;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T, index: number) => ReactNode;
}

interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  rowKey?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function Table<T = Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data found",
  emptyIcon,
  rowKey,
  onRowClick,
  className,
}: TableProps<T>) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-[#1f2d3d]",
        className,
      )}
    >
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#0d1520]">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide",
                  "border-b border-[#1f2d3d] whitespace-nowrap",
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  !col.align && "text-left",
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <div className="flex justify-center">
                  <Spinner size="lg" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  {emptyIcon}
                  <p className="text-sm">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const key = rowKey?.(row, index) ?? String(index);

              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-[#1a2332] transition-colors",
                    "hover:bg-[#131f2e]",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((col) => {
                    const rawVal =
                      typeof col.key === "string"
                        ? (row as Record<string, unknown>)[col.key]
                        : (row as any)[col.key];

                    return (
                      <td
                        key={String(col.key)}
                        className={cn(
                          "px-4 py-3 text-gray-300",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                        )}
                      >
                        {col.render
                          ? col.render(rawVal, row, index)
                          : rawVal !== null && rawVal !== undefined
                            ? String(rawVal)
                            : "—"}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
