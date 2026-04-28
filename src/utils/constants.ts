// src/utils/constants.ts

import { UserRole, UserStatus } from "@/types/auth";

/* ================= ROLE LEVELS ================= */

export const ROLE_LEVELS: Record<UserRole, number> = {
  SUPER_ADMIN: 10,
  ADMIN: 9,
  STATE_MANAGER: 8,
  DISTRICT_MANAGER: 7,
  BLOCK_MANAGER: 6,
  HR_MANAGER: 5,
  DOCTOR: 5,
  PHARMACIST: 5,
  RECEPTIONIST: 4,
  CENTER_STAFF: 3,
  ASSOCIATE: 2,
  FAMILY: 1,
  VENDOR: 1,
};

/* ================= ROLE COLORS ================= */

export const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: "#ef4444",
  ADMIN: "#f97316",
  STATE_MANAGER: "#eab308",
  DISTRICT_MANAGER: "#22c55e",
  BLOCK_MANAGER: "#06b6d4",
  HR_MANAGER: "#8b5cf6",
  DOCTOR: "#3b82f6",
  PHARMACIST: "#10b981",
  RECEPTIONIST: "#f59e0b",
  CENTER_STAFF: "#6b7280",
  ASSOCIATE: "#ec4899",
  FAMILY: "#14b8a6",
  VENDOR: "#a78bfa",
};

/* ================= STATUS COLORS ================= */

export const STATUS_COLORS: Record<UserStatus, string> = {
  ACTIVE: "#22c55e",
  INACTIVE: "#6b7280",
  LOCKED: "#ef4444",
  SUSPENDED: "#f59e0b",
};

/* ================= ROLE LABELS (UI FRIENDLY) ================= */

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  STATE_MANAGER: "State Manager",
  DISTRICT_MANAGER: "District Manager",
  BLOCK_MANAGER: "Block Manager",
  HR_MANAGER: "HR Manager",
  DOCTOR: "Doctor",
  PHARMACIST: "Pharmacist",
  RECEPTIONIST: "Receptionist",
  CENTER_STAFF: "Center Staff",
  ASSOCIATE: "Associate",
  FAMILY: "Family",
  VENDOR: "Vendor",
};

/* ================= PERMISSIONS ================= */

export const ALL_PERMISSIONS: Record<string, string[]> = {
  "User Management": [
    "USER_VIEW",
    "USER_CREATE",
    "USER_EDIT",
    "USER_DELETE",
    "USER_ACTIVATE",
    "USER_DEACTIVATE",
  ],
  Geography: [
    "STATE_VIEW",
    "STATE_CREATE",
    "DISTRICT_VIEW",
    "DISTRICT_CREATE",
    "BLOCK_VIEW",
    "BLOCK_CREATE",
    "CENTER_VIEW",
    "CENTER_CREATE",
    "CENTER_EDIT",
  ],
  "Family & Card": [
    "FAMILY_VIEW",
    "FAMILY_ENROLL",
    "FAMILY_EDIT",
    "CARD_ACTIVATE",
    "CARD_SUSPEND",
    "CARD_EXPIRE",
    "WALLET_VIEW",
    "WALLET_TOPUP",
    "WALLET_WITHDRAW_REQUEST",
    "WALLET_WITHDRAW_APPROVE",
  ],
  Patient: [
    "PATIENT_VIEW",
    "PATIENT_CREATE",
    "PATIENT_EDIT",
    "PATIENT_HISTORY_VIEW",
  ],
  OPD: ["OPD_VIEW", "OPD_CREATE", "OPD_TOKEN_MANAGE", "OPD_QUEUE_VIEW"],
  Prescription: [
    "PRESCRIPTION_VIEW",
    "PRESCRIPTION_CREATE",
    "PRESCRIPTION_EDIT",
  ],
  IPD: ["IPD_VIEW", "IPD_ADMIT", "IPD_DISCHARGE", "BED_VIEW", "BED_MANAGE"],
  Appointment: [
    "APPOINTMENT_VIEW",
    "APPOINTMENT_BOOK",
    "APPOINTMENT_CANCEL",
    "SCHEDULE_VIEW",
    "SCHEDULE_MANAGE",
  ],
  Pharmacy: [
    "MEDICINE_VIEW",
    "MEDICINE_CREATE",
    "MEDICINE_EDIT",
    "STOCK_VIEW",
    "STOCK_ADD",
    "STOCK_DISPENSE",
    "STOCK_ALERT_VIEW",
  ],
  Vendor: [
    "VENDOR_VIEW",
    "VENDOR_APPROVE",
    "VENDOR_CATALOG_VIEW",
    "VENDOR_ORDER_CREATE",
    "VENDOR_ORDER_MANAGE",
  ],
  Billing: [
    "BILLING_VIEW",
    "BILLING_CREATE",
    "BILLING_DISCOUNT_APPLY",
    "BILLING_REFUND",
    "PAYMENT_RECEIVE",
  ],
  Commission: ["COMMISSION_VIEW", "COMMISSION_REPORT_VIEW"],
  HR: [
    "STAFF_VIEW",
    "STAFF_CREATE",
    "STAFF_EDIT",
    "ATTENDANCE_VIEW",
    "ATTENDANCE_MARK",
    "LEAVE_VIEW",
    "LEAVE_APPLY",
    "LEAVE_APPROVE",
    "PAYROLL_VIEW",
    "PAYROLL_PROCESS",
    "PAYROLL_APPROVE",
  ],
  Reports: [
    "REPORT_REVENUE",
    "REPORT_ENROLLMENT",
    "REPORT_STOCK",
    "REPORT_HR",
    "REPORT_COMMISSION",
    "REPORT_EXPORT",
  ],
  System: [
    "SYSTEM_CONFIG_VIEW",
    "SYSTEM_CONFIG_EDIT",
    "AUDIT_LOG_VIEW",
    "NOTIFICATION_VIEW",
  ],
};

/* ================= FLATTEN PERMISSIONS ================= */

export const ALL_PERMISSIONS_LIST: string[] =
  Object.values(ALL_PERMISSIONS).flat();

/* ================= PERMISSION → GROUP MAP ================= */

export const PERMISSION_TO_GROUP: Record<string, string> = {};

Object.entries(ALL_PERMISSIONS).forEach(([group, perms]) => {
  perms.forEach((perm) => {
    PERMISSION_TO_GROUP[perm] = group;
  });
});

/* ================= ERROR MESSAGES ================= */

export const ERROR_MESSAGES: Record<string, string> = {
  ASK_AUTH_001: "Invalid credentials",
  ASK_AUTH_002: "Account locked",
  ASK_AUTH_003: "Account inactive or suspended",
  ASK_AUTH_004: "Token invalid",
  ASK_AUTH_005: "Session expired",
  ASK_USER_001: "User not found",
  ASK_USER_002: "Email already exists",
  ASK_USER_003: "Phone already exists",
  ASK_USER_004: "Hierarchy violation",
  ASK_USER_005: "Geographic scope violation",
  ASK_USER_006: "Cannot modify own account",
  ASK_PERM_001: "Access denied",
  ASK_PERM_002: "Cannot grant this permission",
  ASK_PERM_003: "Hierarchy violation for permission",
  ASK_GEO_001: "State not found",
  ASK_GEO_002: "District not found",
  ASK_GEO_003: "Block not found",
  ASK_GEO_004: "Center not found",
  ASK_GEO_005: "State code already exists",
  ASK_GEO_006: "District code already exists",
};

/* ================= SAFE ERROR HELPER ================= */

export const getErrorMessage = (code?: string): string => {
  if (!code) return "Something went wrong";
  return ERROR_MESSAGES[code] || "Unexpected error occurred";
};

/* ================= GEOGRAPHY REQUIREMENTS ================= */

export const GEOGRAPHY_REQUIRED_BY_ROLE: Partial<Record<UserRole, string[]>> = {
  STATE_MANAGER: ["stateId"],
  DISTRICT_MANAGER: ["stateId", "districtId"],
  BLOCK_MANAGER: ["stateId", "districtId", "blockId"],
  HR_MANAGER: ["stateId", "districtId", "blockId", "centerId"],
  DOCTOR: ["stateId", "districtId", "blockId", "centerId"],
  PHARMACIST: ["stateId", "districtId", "blockId", "centerId"],
  RECEPTIONIST: ["stateId", "districtId", "blockId", "centerId"],
  CENTER_STAFF: ["stateId", "districtId", "blockId", "centerId"],
  ASSOCIATE: ["stateId", "districtId", "blockId", "centerId"],
};
