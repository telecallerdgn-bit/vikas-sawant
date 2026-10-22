import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/** Ledger types that are money owed to people. The commission engine must write these exact names. */
export const PAYEE_TYPES = ["PARTNER_COMMISSION", "SUB_SUPER_SHARE", "DISTRICT_SHARE"];

const LABELS: Record<string, string> = {
  PARTNER_COMMISSION: "Partner commission",
  SUB_SUPER_SHARE: "Sub Super Admin",
  DISTRICT_SHARE: "District Admin",
  RESIDUAL: "Super Admin (residual)",
  GST: "GST",
  GATEWAY_FEE: "Gateway fee",
};

export function typeLabel(t: string) {
  return (
    LABELS[t] ??
    t
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

/** Every Finance page and API calls this first. */
export async function requireFinance() {
  const session = await getSession();
  if (!session || session.role !== "FINANCE") redirect("/portal");

  // Re-check in the database: role or status may have changed after login
  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, role: true, isActive: true },
  });
  if (!me || me.role !== "FINANCE" || !me.isActive) redirect("/portal");

  return me;
}