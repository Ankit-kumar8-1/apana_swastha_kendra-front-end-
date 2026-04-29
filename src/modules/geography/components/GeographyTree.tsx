// src/modules/geography/components/GeographyTree.tsx
"use client";

import { useState, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  MapPin,
  Building2,
  Layers,
  Plus,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/store/authStore";
import { CreateGeoModal } from "./CreateGeoModal";
import type { StateNode, DistrictNode, BlockNode } from "@/types/geography";

interface GeographyTreeProps {
  states: StateNode[];
}

type ModalState =
  | { level: "district"; parentId: string; parentName: string }
  | { level: "block"; parentId: string; parentName: string }
  | { level: "center"; parentId: string; parentName: string }
  | null;

function CenterCount({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium
      bg-[#1a2332] text-gray-500 border border-[#1f2d3d] rounded-full px-2 py-0.5"
    >
      <Building2 size={9} />
      {count} center{count !== 1 ? "s" : ""}
    </span>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="inline-flex items-center gap-1 text-[10px] font-medium
        text-green-500/70 hover:text-green-400 hover:bg-green-500/10
        rounded px-1.5 py-0.5 transition-colors ml-1"
    >
      <Plus size={9} />
      {label}
    </button>
  );
}

function BlockRow({
  block,
  canAddCenter,
  onAddCenter,
}: {
  block: BlockNode;
  canAddCenter: boolean;
  onAddCenter: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 py-2 px-3 rounded-lg
      hover:bg-[#1a2332] transition-colors group"
    >
      <Layers size={13} className="text-gray-600 shrink-0" />
      <span className="text-sm text-gray-400 flex-1 truncate">
        {block.name}
      </span>
      <span className="text-[10px] text-gray-600 font-mono">{block.code}</span>
      <CenterCount count={block.centersCount ?? 0} />
      {canAddCenter && <AddButton label="Add Center" onClick={onAddCenter} />}
    </div>
  );
}

function DistrictRow({
  district,
  canAddBlock,
  canAddCenter,
  onAddBlock,
  onAddCenter,
}: {
  district: DistrictNode;
  canAddBlock: boolean;
  canAddCenter: boolean;
  onAddBlock: () => void;
  onAddCenter: (blockId: string, blockName: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const totalCenters = district.blocks.reduce(
    (s, b) => s + (b.centersCount ?? 0),
    0,
  );

  return (
    <div>
      <div
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 py-2.5 px-3 rounded-lg
          cursor-pointer hover:bg-[#1a2332] transition-colors group"
      >
        {open ? (
          <ChevronDown size={13} className="text-gray-500 shrink-0" />
        ) : (
          <ChevronRight size={13} className="text-gray-600 shrink-0" />
        )}

        <MapPin size={13} className="text-blue-400/70 shrink-0" />

        <span className="text-sm text-gray-300 flex-1 truncate font-medium">
          {district.name}
        </span>

        <span className="text-[10px] text-gray-600 font-mono">
          {district.code}
        </span>

        <span className="text-[10px] text-gray-600">
          {district.blocks.length} block
          {district.blocks.length !== 1 ? "s" : ""}
        </span>

        <CenterCount count={totalCenters} />

        {canAddBlock && <AddButton label="Add Block" onClick={onAddBlock} />}
      </div>

      {open && (
        <div className="ml-6 border-l border-[#1f2d3d] pl-3 space-y-0.5">
          {district.blocks.length === 0 ? (
            <p className="text-xs text-gray-700 py-2 px-3">No blocks yet</p>
          ) : (
            district.blocks.map((block) => (
              <BlockRow
                key={block.id}
                block={block}
                canAddCenter={canAddCenter}
                onAddCenter={() => onAddCenter(block.id, block.name)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function GeographyTree({ states }: GeographyTreeProps) {
  const { hasPermission } = useAuthStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modalState, setModalState] = useState<ModalState>(null);

  const canAddDistrict = hasPermission("DISTRICT_CREATE");
  const canAddBlock = hasPermission("BLOCK_CREATE");
  const canAddCenter = hasPermission("CENTER_CREATE");

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  if (!states || states.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-700">
        <LayoutGrid size={40} className="mb-3 opacity-30" />
        <p className="text-sm">No geography data yet.</p>
        <p className="text-xs mt-1">Add a state to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {states.map((state) => {
          const isOpen = expanded.has(state.id);

          const totalBlocks = state.districts.reduce(
            (s, d) => s + d.blocks.length,
            0,
          );

          const totalCenters = state.districts
            .flatMap((d) => d.blocks)
            .reduce((s, b) => s + (b.centersCount ?? 0), 0);

          return (
            <div
              key={state.id}
              className="rounded-xl border border-[#1f2d3d] bg-[#111827] overflow-hidden"
            >
              <div
                onClick={() => toggle(state.id)}
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer
                  hover:bg-[#131f2e] transition-colors"
              >
                {isOpen ? (
                  <ChevronDown size={15} className="text-gray-500 shrink-0" />
                ) : (
                  <ChevronRight size={15} className="text-gray-600 shrink-0" />
                )}

                <div
                  className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center
                  justify-center shrink-0"
                >
                  <MapPin size={15} className="text-yellow-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-100 truncate">
                    {state.name}
                  </p>
                  <p className="text-[10px] text-gray-600 font-mono">
                    {state.code}
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-[10px] text-gray-600 shrink-0">
                  <span>{state.districts.length} dist.</span>
                  <span>{totalBlocks} blocks</span>
                  <CenterCount count={totalCenters} />
                </div>

                {canAddDistrict && (
                  <AddButton
                    label="Add District"
                    onClick={() =>
                      setModalState({
                        level: "district",
                        parentId: state.id,
                        parentName: state.name,
                      })
                    }
                  />
                )}
              </div>

              {isOpen && (
                <div className="border-t border-[#1a2332] px-4 py-3 space-y-1">
                  {state.districts.length === 0 ? (
                    <p className="text-xs text-gray-700 py-2 text-center">
                      No districts yet
                    </p>
                  ) : (
                    state.districts.map((district) => (
                      <DistrictRow
                        key={district.id}
                        district={district}
                        canAddBlock={canAddBlock}
                        canAddCenter={canAddCenter}
                        onAddBlock={() =>
                          setModalState({
                            level: "block",
                            parentId: district.id,
                            parentName: district.name,
                          })
                        }
                        onAddCenter={(blockId, blockName) =>
                          setModalState({
                            level: "center",
                            parentId: blockId,
                            parentName: blockName,
                          })
                        }
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalState && (
        <CreateGeoModal
          open
          onClose={() => setModalState(null)}
          level={modalState.level}
          parentId={modalState.parentId}
          parentName={modalState.parentName}
        />
      )}
    </>
  );
}
