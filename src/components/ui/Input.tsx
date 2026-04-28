// src/components/ui/Input.tsx
"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconEnd?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconEnd, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : generatedId);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-gray-400 tracking-wide uppercase"
          >
            {label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-gray-500 pointer-events-none">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              "w-full rounded-lg border bg-[#1a2332] text-gray-100 text-sm",
              "placeholder:text-gray-600 transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/60",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-red-500/60 focus:ring-red-500/30"
                : "border-[#1f2d3d] hover:border-[#2a3d52]",
              icon ? "pl-9" : "pl-3",
              iconEnd ? "pr-9" : "pr-3",
              "py-2",
              className,
            )}
            {...props}
          />

          {iconEnd && (
            <span className="absolute right-3 text-gray-500">{iconEnd}</span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-400">
            {error}
          </p>
        )}

        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
