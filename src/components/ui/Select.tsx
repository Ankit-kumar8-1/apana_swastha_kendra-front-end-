// src/components/ui/Select.tsx
"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, placeholder, options, className, id, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const selectId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : generatedId);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium text-gray-400 tracking-wide uppercase"
          >
            {label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${selectId}-error`
                : hint
                  ? `${selectId}-hint`
                  : undefined
            }
            className={cn(
              "w-full appearance-none rounded-lg border bg-[#1a2332] text-gray-100 text-sm",
              "px-3 py-2 pr-9 transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/60",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-red-500/60 focus:ring-red-500/30"
                : "border-[#1f2d3d] hover:border-[#2a3d52]",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}

            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>

        {error && (
          <p id={`${selectId}-error`} className="text-xs text-red-400">
            {error}
          </p>
        )}

        {!error && hint && (
          <p id={`${selectId}-hint`} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
