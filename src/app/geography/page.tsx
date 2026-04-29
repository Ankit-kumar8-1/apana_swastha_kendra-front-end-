// src/app/geography/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus,
  MapPin,
  Building2,
  Layers,
  LayoutGrid,
  RefreshCw,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { GeographyTree } from "@/modules/geography/components/GeographyTree";
import { CreateGeoModal } from "@/modules/geography/components/CreateGeoModal";

import { useGeographyStore } from "@/store/geographyStore";
import { useAuthStore } from "@/store/authStore";

export default function GeographyPage() {
  const { tree, loading, error, fetchTree, clearError } = useGeographyStore();

  const { hasPermission } = useAuthStore();

  const [addStateOpen, setAddStateOpen] = useState(false);

  const canAddState = hasPermission("STATE_CREATE");

  // stable fetch reference to avoid unnecessary effect triggers
  const loadTree = useCallback(() => {
    fetchTree();
  }, [fetchTree]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const stats = useMemo(() => {
    if (!tree?.states?.length) {
      return { states: 0, districts: 0, blocks: 0, centers: 0 };
    }

    let districts = 0;
    let blocks = 0;
    let centers = 0;

    for (const state of tree.states) {
      districts += state.districts?.length ?? 0;

      for (const district of state.districts ?? []) {
        blocks += district.blocks?.length ?? 0;

        for (const block of district.blocks ?? []) {
          centers += block.centersCount ?? 0;
        }
      }
    }

    return {
      states: tree.states.length,
      districts,
      blocks,
      centers,
    };
  }, [tree]);

  const handleRefresh = useCallback(() => {
    fetchTree();
  }, [fetchTree]);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-gray-100">Geography</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage states, districts, blocks and centers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>

            {canAddState && (
              <Button
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => setAddStateOpen(true)}
              >
                Add State
              </Button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert type="error" onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="States"
            value={stats.states}
            icon={<MapPin size={16} />}
            color="#eab308"
            loading={loading}
          />
          <StatCard
            label="Districts"
            value={stats.districts}
            icon={<LayoutGrid size={16} />}
            color="#06b6d4"
            loading={loading}
          />
          <StatCard
            label="Blocks"
            value={stats.blocks}
            icon={<Layers size={16} />}
            color="#8b5cf6"
            loading={loading}
          />
          <StatCard
            label="Centers"
            value={stats.centers}
            icon={<Building2 size={16} />}
            color="#22c55e"
            loading={loading}
          />
        </div>

        {/* Tree */}
        {loading && !tree ? (
          <div className="flex justify-center py-20">
            <Spinner size="xl" />
          </div>
        ) : (
          <GeographyTree states={tree?.states ?? []} />
        )}

        {/* Add State modal */}
        {addStateOpen && (
          <CreateGeoModal
            open
            onClose={() => setAddStateOpen(false)}
            level="state"
          />
        )}
      </div>
    </AppShell>
  );
}
