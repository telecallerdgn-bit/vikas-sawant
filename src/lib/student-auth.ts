import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getKindSession } from "@/lib/kind-session";

/** Call at the top of every student page. Re-checks the database, so a disabled account is locked out at once. */
export async function requireStudent() {
  const s = await getKindSession("student");
  if (!s) redirect("/student/login");

  const me = await prisma.student.findUnique({
    where: { id: s.id },
    select: {
      id: true,
      name: true,
      mobile: true,
      email: true,
      isActive: true,
      partner: { select: { name: true } },
    },
  });
  if (!me || !me.isActive) redirect("/student/login");

  return me;
}