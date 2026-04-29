// src/modules/geography/components/CreateGeoModal.tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { useGeographyStore } from "@/store/geographyStore";

type GeoLevel = "state" | "district" | "block" | "center";

interface CreateGeoModalProps {
  open: boolean;
  onClose: () => void;
  level: GeoLevel;
  parentId?: string;
  parentName?: string;
}

const LEVEL_CONFIG: Record<
  GeoLevel,
  { title: string; codeLabel: string; needsCode: boolean }
> = {
  state: {
    title: "Add State",
    codeLabel: "State Code (e.g. BR)",
    needsCode: true,
  },
  district: {
    title: "Add District",
    codeLabel: "District Code (e.g. PAT)",
    needsCode: true,
  },
  block: {
    title: "Add Block",
    codeLabel: "Block Code (e.g. PHU)",
    needsCode: true,
  },
  center: {
    title: "Add Center",
    codeLabel: "Address (optional)",
    needsCode: false,
  },
};

export function CreateGeoModal({
  open,
  onClose,
  level,
  parentId,
  parentName,
}: CreateGeoModalProps) {
  const { createState, createDistrict, createBlock, createCenter, fetchTree } =
    useGeographyStore();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState("");

  const cfg = LEVEL_CONFIG[level];

  const reset = () => {
    setName("");
    setCode("");
    setPhone("");
    setErrors({});
    setApiErr("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};

    if (!name.trim()) errs.name = "Name is required";
    if (cfg.needsCode && !code.trim()) errs.code = "Code is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const ensureParent = (): boolean => {
    if (level !== "state" && !parentId) {
      setApiErr("Missing parent reference");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate() || !ensureParent()) return;

    setLoading(true);
    setApiErr("");

    try {
      const trimmedName = name.trim();
      const trimmedCode = code.trim().toUpperCase();

      switch (level) {
        case "state":
          await createState({ name: trimmedName, code: trimmedCode });
          break;

        case "district":
          await createDistrict({
            stateId: parentId as string,
            name: trimmedName,
            code: trimmedCode,
          });
          break;

        case "block":
          await createBlock({
            districtId: parentId as string,
            name: trimmedName,
            code: trimmedCode,
          });
          break;

        case "center":
          await createCenter({
            blockId: parentId as string,
            name: trimmedName,
            address: code.trim() || undefined,
            phone: phone.trim() || undefined,
          });
          break;
      }

      await fetchTree();
      handleClose();
    } catch (e) {
      setApiErr(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={cfg.title}
      subtitle={parentName ? `Under: ${parentName}` : undefined}
      width={420}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" loading={loading} onClick={handleSubmit}>
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {apiErr && (
          <Alert type="error" onClose={() => setApiErr("")}>
            {apiErr}
          </Alert>
        )}

        <Input
          label={`${level.charAt(0).toUpperCase() + level.slice(1)} Name`}
          placeholder={`e.g. ${
            level === "state"
              ? "Bihar"
              : level === "district"
                ? "Patna"
                : level === "block"
                  ? "Phulwari"
                  : "Phulwari Health Center"
          }`}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((er) => ({ ...er, name: "" }));
          }}
          error={errors.name}
          required
        />

        {cfg.needsCode ? (
          <Input
            label={cfg.codeLabel}
            placeholder={
              level === "state" ? "BR" : level === "district" ? "PAT" : "PHU"
            }
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setErrors((er) => ({ ...er, code: "" }));
            }}
            hint="Short unique code — stored in uppercase"
            error={errors.code}
            required
          />
        ) : (
          <>
            <Input
              label="Address (optional)"
              placeholder="Village Road, Near Panchayat Bhawan"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Input
              label="Phone (optional)"
              placeholder="9876543210"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              hint="Center contact number"
            />
          </>
        )}
      </div>
    </Modal>
  );
}
