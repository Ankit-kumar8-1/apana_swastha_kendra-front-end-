"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "User Management",
  "/geography": "Geography",
  "/profile": "My Profile",
  "/opd": "OPD Queue",
  "/pharmacy": "Pharmacy",
  "/billing": "Billing",
  "/hr": "Human Resources",
  "/reports": "Reports",
};

function getTitle(pathname: string | null): string {
  if (!pathname) return "ASK Platform";

  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // Prefix match
  const prefix = Object.keys(PAGE_TITLES).find(
    (k) => k !== "/dashboard" && pathname.startsWith(k),
  );

  return prefix ? PAGE_TITLES[prefix] : "ASK Platform";
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#0a0f1a] overflow-hidden">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar title={title} onMobileMenu={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
