"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-green-500 hover:bg-green-600 text-white border-transparent",
  secondary: "bg-[#1a2332] hover:bg-[#1e2a3b] text-gray-200 border-[#1f2d3d]",
  danger: "bg-red-600 hover:bg-red-700 text-white border-transparent",
  ghost: "bg-transparent hover:bg-[#1a2332] text-gray-300 border-transparent",
  outline: "bg-transparent hover:bg-[#1a2332] text-green-400 border-green-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      icon,
      children,
      disabled,
      className,
      type = "button", // prevent default submit behavior
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg border",
          "transition-colors duration-150 focus:outline-none focus:ring-2",
          "focus:ring-green-500/40 focus:ring-offset-1 focus:ring-offset-[#0a0f1a]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2
            className="animate-spin shrink-0"
            size={size === "sm" ? 14 : 16}
          />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}

        {children && <span className="whitespace-nowrap">{children}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";
