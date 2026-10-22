import { prisma } from "@/lib/prisma";
import { getKindSession } from "@/lib/kind-session";

/** For API routes. Returns the active Student Admin, or null. */
export async function getSadminForApi() {
  const s = await getKindSession("sadmin");
  if (!s) return null;
  const me = await prisma.studentAdmin.findUnique({
    where: { id: s.id },
    select: { id: true, name: true, email: true, isActive: true },
  });
  return me && me.isActive ? me : null;
}