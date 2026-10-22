/**
 * Base URL of every dashboard. Change a path here and every link follows.
 * Each value must match the folder name under src/app.
 * Keep this file free of server-only imports, because client components use it.
 */
export const PARTNER_BASE = "/partner-portal";
export const PACKING_BASE = "/packing";
export const ADMIN_BASE = "/admin";
export const DISTRICT_BASE = "/district";
export const FINANCE_BASE = "/finance";
export const STUDENT_BASE = "/student";
export const SUB_SUPER_BASE = "/sub-super";

/** Landing page of each role after login. Keys match the Role enum in schema.prisma. */
export const ROLE_HOME: Record<string, string> = {
  ADMIN: ADMIN_BASE,
  PARTNER: PARTNER_BASE,
  DISTRICT_ADMIN: DISTRICT_BASE,
  SUB_SUPER: SUB_SUPER_BASE,
  FINANCE: FINANCE_BASE,
  PACKING: PACKING_BASE,
  STUDENT: STUDENT_BASE,
};