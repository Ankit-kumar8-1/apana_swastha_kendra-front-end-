"use client";

import { useState } from "react";
import { Menu, LogOut, KeyRound, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { useUser, useAuthStore } from "@/store/authStore";
import { RoleBadge } from "@/components/ui/Badge";
import { formatRoleName } from "@/utils/format";
import { ROLE_COLORS } from "@/utils/constants";

interface TopbarProps {
  title: string;
  onMobileMenu: () => void;
}

export function Topbar({ title, onMobileMenu }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useUser();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .filter(Boolean) // empty strings remove
        .map((n: string) => n.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const roleColor = user ? (ROLE_COLORS[user.role] ?? "#22c55e") : "#22c55e";

  return (
    <header
      className="h-14 border-b border-[#1f2d3d] bg-[#0d1520]/80 backdrop-blur-sm
      flex items-center justify-between px-4 sticky top-0 z-30 shrink-0"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenu}
          className="md:hidden text-gray-500 hover:text-gray-200 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-semibold text-gray-100">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Online indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Online
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg
              hover:bg-[#1a2332] transition-colors"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: roleColor }}
            >
              {initials}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-gray-200 leading-tight truncate max-w-[120px]">
                {user?.fullName ?? "—"}
              </p>
              <p className="text-[10px] text-gray-500">
                {user ? formatRoleName(user.role) : "—"}
              </p>
            </div>

            <ChevronDown size={14} className="text-gray-500 hidden sm:block" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />

              <div
                className="absolute right-0 top-full mt-1.5 w-52 bg-[#111827] border
                border-[#1f2d3d] rounded-xl shadow-2xl z-20 py-1 overflow-hidden"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-[#1f2d3d]">
                  <p className="text-sm font-semibold text-gray-100 truncate">
                    {user?.fullName ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {user?.email ?? "—"}
                  </p>
                  <div className="mt-2">
                    {user && <RoleBadge role={user.role} />}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400
                    hover:text-gray-200 hover:bg-[#1a2332] transition-colors"
                >
                  <KeyRound size={15} />
                  Change Password
                </button>

                <div className="border-t border-[#1f2d3d] mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400
                      hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
