// src/components/ui/Modal.tsx
"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 520,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  /* ================= ESC CLOSE ================= */
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* ================= SCROLL LOCK ================= */
  useEffect(() => {
    if (!open) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // safer than onClick for edge cases
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full bg-[#111827] border border-[#1f2d3d] rounded-2xl shadow-2xl",
          "flex flex-col max-h-[90vh]",
          className,
        )}
        style={{ maxWidth: width }}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[#1f2d3d] shrink-0">
            <div className="min-w-0">
              {title && (
                <h2 className="text-base font-semibold text-gray-100 truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="text-gray-500 hover:text-gray-300 transition-colors shrink-0 mt-0.5 focus:outline-none focus:ring-2 focus:ring-green-500/40"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#1f2d3d] shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
