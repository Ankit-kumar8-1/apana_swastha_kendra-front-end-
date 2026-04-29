// src/components/layout/Sidebar.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MapPin,
  User,
  Stethoscope,
  Pill,
  Receipt,
  ClipboardList,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useUser, useAuthStore } from "@/store/authStore";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Users",
    href: "/users",
    icon: <Users size={18} />,
    permission: "USER_VIEW",
  },
  {
    label: "Geography",
    href: "/geography",
    icon: <MapPin size={18} />,
    permission: "STATE_VIEW",
  },
  { label: "Profile", href: "/profile", icon: <User size={18} /> },
  {
    label: "OPD",
    href: "/opd",
    icon: <Stethoscope size={18} />,
    comingSoon: true,
  },
  {
    label: "Pharmacy",
    href: "/pharmacy",
    icon: <Pill size={18} />,
    comingSoon: true,
  },
  {
    label: "Billing",
    href: "/billing",
    icon: <Receipt size={18} />,
    comingSoon: true,
  },
  {
    label: "HR",
    href: "/hr",
    icon: <ClipboardList size={18} />,
    comingSoon: true,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: <BarChart3 size={18} />,
    comingSoon: true,
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname() ?? "";
  const user = useUser();
  const { hasPermission } = useAuthStore();

  const visibleItems = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      if (item.comingSoon) return true;
      if (!item.permission) return true;
      return hasPermission(item.permission);
    });
  }, [hasPermission]);

  const isActiveRoute = (href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const sidebarContent = (
    <div
      className={cn(
        "flex flex-col h-full bg-[#0d1520] border-r border-[#1f2d3d]",
        "transition-all duration-200",
        collapsed ? "w-[68px]" : "w-[240px]",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[#1f2d3d] h-14 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
          <Heart size={16} className="text-green-400" fill="currentColor" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-100 leading-tight">ASK</p>
            <p className="text-[10px] text-gray-500 truncate">
              Apana Swastha Kendra
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive = isActiveRoute(item.href);

          return (
            <div key={item.href} className="relative group">
              {item.comingSoon ? (
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed",
                    "text-gray-600",
                    collapsed && "justify-center",
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="text-sm truncate flex-1">
                      {item.label}
                    </span>
                  )}
                  {!collapsed && (
                    <span className="text-[10px] bg-[#1a2332] text-gray-600 px-1.5 py-0.5 rounded-full shrink-0">
                      Soon
                    </span>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    collapsed && "justify-center",
                    isActive
                      ? "bg-green-500/15 text-green-400"
                      : "text-gray-500 hover:text-gray-200 hover:bg-[#1a2332]",
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="text-sm truncate">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  )}
                </Link>
              )}

              {/* Tooltip */}
              {collapsed && (
                <div
                  className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50
                  opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
                >
                  <div
                    className="bg-[#1a2332] text-gray-200 text-xs px-2.5 py-1.5 rounded-lg
                    border border-[#1f2d3d] whitespace-nowrap shadow-xl"
                  >
                    {item.label}
                    {item.comingSoon && " (Soon)"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="hidden md:flex justify-end p-2 border-t border-[#1f2d3d] shrink-0">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-7 h-7 rounded-lg flex items-center justify-center
            text-gray-600 hover:text-gray-300 hover:bg-[#1a2332] transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={(e) => {
              e.stopPropagation();
              onMobileClose();
            }}
          />
          <aside className="relative z-10 flex h-full">{sidebarContent}</aside>
        </div>
      )}
    </>
  );
}
