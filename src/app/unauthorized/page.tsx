"use client";

import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="w-24 h-24 rounded-2xl bg-red-500/10 border border-red-500/20
            flex items-center justify-center"
          >
            <ShieldX size={48} className="text-red-400" />
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">
            Error 403
          </p>
          <h1 className="text-2xl font-bold text-gray-100 mb-3">
            Access Denied
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            You don&apos;t have permission to access this page. Contact your
            administrator if you believe this is a mistake.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button variant="primary" icon={<ArrowLeft size={15} />}>
              Back to Dashboard
            </Button>
          </Link>

          <Link href="/profile">
            <Button variant="secondary">View My Permissions</Button>
          </Link>
        </div>

        {/* Decoration */}
        <div className="pt-4 border-t border-[#1f2d3d]">
          <p className="text-[10px] text-gray-700">
            ASK Platform — Apana Swastha Kendra
          </p>
        </div>
      </div>
    </div>
  );
}
