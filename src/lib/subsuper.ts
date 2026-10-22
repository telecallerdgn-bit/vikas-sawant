import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/** Ledger entry type the commission engine will write for the Sub Super share. */
export const SHARE_TYPE = "SUB_SUPER_SHARE";

/** Every Sub Super page and layout calls this first. */
export async function requireSubSuper() {
  const session = await getSession();
  if (!session || session.role !== "SUB_SUPER") redirect("/portal");

  // Re-check in the database: role or status may have changed after login
  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, role: true, isActive: true },
  });
  if (!me || me.role !== "SUB_SUPER" || !me.isActive) redirect("/portal");

  return me;
}