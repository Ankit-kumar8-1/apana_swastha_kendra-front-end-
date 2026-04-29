// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Users,
  MapPin,
  Building2,
  UserCheck,
  Shield,
  Clock,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { RoleBadge, StatusBadge } from "@/components/ui/Badge";
import { useUser } from "@/store/authStore";
import { formatRelativeTime } from "@/utils/format";
import { ALL_PERMISSIONS, ROLE_COLORS } from "@/utils/constants";
import api from "@/lib/axios";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalStates: number;
  totalCenters: number;
}

interface RecentUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const user = useUser();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, geoRes] = await Promise.all([
          api.get("/users"),
          api.get("/geography/tree"),
        ]);

        const users: RecentUser[] = usersRes?.data?.data ?? [];

        let stateCount = 0;
        let centerCount = 0;

        const tree = geoRes?.data?.data;

        if (tree?.states?.length) {
          stateCount = tree.states.length;

          for (const s of tree.states) {
            for (const d of s?.districts ?? []) {
              for (const b of d?.blocks ?? []) {
                centerCount += Number(b?.centersCount ?? 0);
              }
            }
          }
        }

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u) => u?.status === "ACTIVE").length,
          totalStates: stateCount,
          totalCenters: centerCount,
        });

        setRecentUsers(
          [...users]
            .filter((u) => u?.createdAt)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 8),
        );
      } catch {
        // silent fail (backend not ready)
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const userPermSet = new Set(user?.permissions ?? []);
  const roleColor = user ? (ROLE_COLORS[user.role] ?? "#22c55e") : "#22c55e";

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .filter(Boolean)
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div
          className="rounded-xl border border-[#1f2d3d] bg-gradient-to-r
          from-[#111827] to-[#0f1d2e] p-5 flex items-center gap-4"
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center
              text-lg font-bold text-white shrink-0"
            style={{ backgroundColor: roleColor }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">Welcome back</p>
            <h2 className="text-lg font-bold text-gray-100 truncate">
              {user?.fullName ?? "—"}
            </h2>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {user && <RoleBadge role={user.role} />}

              {user?.lastLoginAt && (
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Clock size={11} />
                  Last login {formatRelativeTime(user.lastLoginAt)}
                </span>
              )}
            </div>
          </div>

          <div className="hidden sm:block text-right shrink-0">
            <p className="text-xs text-gray-600">Permissions</p>
            <p className="text-2xl font-bold text-green-400">
              {user?.permissions?.length ?? 0}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={stats?.totalUsers ?? "—"}
            icon={<Users size={18} />}
            color="#3b82f6"
            loading={loading}
          />
          <StatCard
            label="Active Users"
            value={stats?.activeUsers ?? "—"}
            icon={<UserCheck size={18} />}
            color="#22c55e"
            loading={loading}
          />
          <StatCard
            label="States"
            value={stats?.totalStates ?? "—"}
            icon={<MapPin size={18} />}
            color="#eab308"
            loading={loading}
          />
          <StatCard
            label="Centers"
            value={stats?.totalCenters ?? "—"}
            icon={<Building2 size={18} />}
            color="#8b5cf6"
            loading={loading}
          />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent Users */}
          <Card
            title="Recent Users"
            subtitle="Last 8 users added"
            className="lg:col-span-3"
          >
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1a2332] animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 bg-[#1a2332] rounded animate-pulse" />
                      <div className="h-2.5 w-48 bg-[#1a2332] rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="py-8 text-center text-gray-600 text-sm">
                No users found
              </div>
            ) : (
              <div className="space-y-2">
                {recentUsers.map((u) => {
                  const color = ROLE_COLORS[u.role] ?? "#6b7280";

                  const init =
                    u.fullName
                      ?.split(" ")
                      .filter(Boolean)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() ?? "?";

                  return (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[#1a2332] transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {init}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 font-medium truncate">
                          {u.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {u.email}
                        </p>
                      </div>

                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <RoleBadge role={u.role} />
                        <StatusBadge status={u.status} />
                      </div>

                      <span className="text-[10px] text-gray-600 shrink-0 hidden md:block">
                        {formatRelativeTime(u.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Permissions */}
          <Card
            title="My Permissions"
            subtitle={`${user?.permissions?.length ?? 0} active`}
            className="lg:col-span-2"
          >
            <div className="max-h-[340px] overflow-y-auto pr-1 space-y-1">
              {Object.entries(ALL_PERMISSIONS).map(([category, perms]) => {
                const active = perms.filter((p) => userPermSet.has(p));
                if (!active.length) return null;

                return (
                  <div key={category} className="mb-3">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Shield size={10} />
                      {category}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {active.map((p) => (
                        <span
                          key={p}
                          className="text-[10px] font-mono bg-green-500/10 text-green-400 border border-green-500/20 rounded px-1.5 py-0.5"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {(!user || user.permissions?.length === 0) && (
                <p className="text-sm text-gray-600 py-4 text-center">
                  No permissions assigned
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
