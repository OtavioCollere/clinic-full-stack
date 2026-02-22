/**
 * Portal/role types and config: which portal each role lands on,
 * which roles can access which portal, and menu items per role.
 */

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Syringe,
  Receipt,
  Stethoscope,
  CalendarCheck,
} from "lucide-react";

export type ClinicRoleType = "OWNER" | "ADMIN" | "PROFESSIONAL" | "PATIENT";

export type PortalSegment = "dashboard" | "professional" | "patient";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string; // relative to portal root, e.g. "/dashboard", "/professional"
}

/** Base path for each portal (no leading slash in config; tenant is prepended in navigation) */
export const PORTAL_BASE: Record<PortalSegment, string> = {
  dashboard: "/dashboard",
  professional: "/professional",
  patient: "/patient",
};

/**
 * After login, which portal should the user be redirected to?
 */
export function getPortalBaseForRole(role: ClinicRoleType): string {
  switch (role) {
    case "OWNER":
    case "ADMIN":
      return PORTAL_BASE.dashboard;
    case "PROFESSIONAL":
      return "/professional/appointments";
    case "PATIENT":
      return "/patient/appointments";
    default:
      return "/patient/appointments";
  }
}

/**
 * Which portal segment does the given path belong to?
 */
export function getPortalSegmentFromPath(pathWithoutTenant: string): PortalSegment | null {
  if (pathWithoutTenant.startsWith("/dashboard")) return "dashboard";
  if (pathWithoutTenant.startsWith("/professional")) return "professional";
  if (pathWithoutTenant.startsWith("/patient")) return "patient";
  return null;
}

/**
 * Can this role access this portal?
 * ADMIN/OWNER can access all portals.
 */
export function canAccessPortal(role: ClinicRoleType, portal: PortalSegment): boolean {
  if (role === "OWNER" || role === "ADMIN") return true;
  if (portal === "dashboard") return false;
  if (portal === "professional") return role === "PROFESSIONAL";
  if (portal === "patient") return role === "PATIENT";
  return false;
}

/** Menu items for admin/owner: full dashboard */
const MENU_DASHBOARD: MenuItem[] = [
  { icon: LayoutDashboard, label: "Painel", path: "/dashboard" },
  { icon: Calendar, label: "Consultas", path: "/dashboard/appointments" },
  { icon: Users, label: "Pacientes", path: "/dashboard/patients" },
  { icon: UserCheck, label: "Profissionais", path: "/dashboard/professionals" },
  { icon: Syringe, label: "Procedimentos", path: "/dashboard/procedures" },
  { icon: Receipt, label: "Faturamento", path: "/dashboard/billing" },
];

/** Menu items for professional - Agendamentos (pacientes que atendeu) é a tela principal */
const MENU_PROFESSIONAL: MenuItem[] = [
  { icon: CalendarCheck, label: "Agendamentos", path: "/professional/appointments" },
  { icon: LayoutDashboard, label: "Painel", path: "/professional" },
  { icon: Users, label: "Pacientes", path: "/professional/patients" },
  // { icon: Syringe, label: "Procedimentos", path: "/professional/procedures" },
];

/** Menu items for patient - mesma tela de consultas do dashboard */
const MENU_PATIENT: MenuItem[] = [
  // { icon: Stethoscope, label: "Início", path: "/patient" },
  { icon: Calendar, label: "Consultas", path: "/patient/appointments" },
];

export function getMenuByRole(role: ClinicRoleType): MenuItem[] {
  switch (role) {
    case "OWNER":
    case "ADMIN":
      return MENU_DASHBOARD;
    case "PROFESSIONAL":
      return MENU_PROFESSIONAL;
    case "PATIENT":
      return MENU_PATIENT;
    default:
      return MENU_PATIENT;
  }
}
