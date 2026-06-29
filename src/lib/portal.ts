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
  Stethoscope,
  CalendarCheck,
  Package,
  Receipt,
} from "lucide-react";

export type ClinicRoleType = "OWNER" | "ADMIN" | "PROFESSIONAL" | "PATIENT" | "COLLABORATOR";

export type PortalSegment = "dashboard" | "professional" | "patient";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

/** Base path for each portal */
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
    case "COLLABORATOR":
      return PORTAL_BASE.dashboard;
    case "PROFESSIONAL":
      return "/professional";
    case "PATIENT":
      return "/patient";
    default:
      return "/patient";
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
 */
export function canAccessPortal(role: ClinicRoleType, portal: PortalSegment): boolean {
  if (role === "OWNER" || role === "ADMIN") return true;
  if (role === "COLLABORATOR") return portal === "dashboard";
  if (portal === "dashboard") return false;
  if (portal === "professional") return role === "PROFESSIONAL";
  if (portal === "patient") return role === "PATIENT";
  return false;
}

/** Menu items for admin/owner: full dashboard */
const MENU_DASHBOARD: MenuItem[] = [
  { icon: LayoutDashboard, label: "Painel",         path: "/dashboard" },
  { icon: Calendar,        label: "Consultas",       path: "/dashboard/appointments" },
  { icon: Users,           label: "Pacientes",       path: "/dashboard/patients" },
  { icon: UserCheck,       label: "Profissionais",   path: "/dashboard/professionals" },
  { icon: Syringe,         label: "Procedimentos",   path: "/dashboard/procedures" },
  { icon: Package,         label: "Insumos",         path: "/dashboard/inventory" },
  { icon: Receipt,         label: "Comandas",        path: "/dashboard/comandas" },
];

/** Menu items for collaborator (receptionist): patients + appointments only */
const MENU_COLLABORATOR: MenuItem[] = [
  { icon: Calendar, label: "Consultas", path: "/dashboard/appointments" },
  { icon: Users,    label: "Pacientes", path: "/dashboard/patients" },
];

/** Menu items for professional */
const MENU_PROFESSIONAL: MenuItem[] = [
  { icon: CalendarCheck, label: "Home",     path: "/professional" },
  { icon: Calendar,      label: "Consultas", path: "/professional/appointments" },
  { icon: Stethoscope,   label: "Perfil",   path: "/professional/profile" },
];

/** Menu items for patient */
const MENU_PATIENT: MenuItem[] = [
  { icon: Calendar,    label: "Home",  path: "/patient" },
  { icon: Stethoscope, label: "Perfil", path: "/patient/profile" },
];

export function getMenuByRole(role: ClinicRoleType): MenuItem[] {
  switch (role) {
    case "OWNER":
    case "ADMIN":
      return MENU_DASHBOARD;
    case "COLLABORATOR":
      return MENU_COLLABORATOR;
    case "PROFESSIONAL":
      return MENU_PROFESSIONAL;
    case "PATIENT":
      return MENU_PATIENT;
    default:
      return MENU_PATIENT;
  }
}
