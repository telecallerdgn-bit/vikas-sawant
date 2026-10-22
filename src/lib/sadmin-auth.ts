import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getKindSession } from "@/lib/kind-session";

/** Call at the top of every Student Admin page and API. */
export async function requireStudentAdmin() {
  const s = await getKindSession("sadmin");
  if (!s) redirect("/student-admin/login");

  const me = await prisma.studentAdmin.findUnique({
    where: { id: s.id },
    select: { id: true, name: true, email: true, isActive: true },
  });
  if (!me || !me.isActive) redirect("/student-admin/login");

  return me;
}