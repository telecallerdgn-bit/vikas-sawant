import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * District panel ke har page/layout me use hota hai.
 * - login nahi hai ya role DISTRICT_ADMIN nahi hai -> /login par bhej deta hai
 * - us admin ka district dhoondhta hai (Districts page me jo "District admin" set hota hai)
 * cache() se ek request me query sirf ek baar chalti hai.
 */
export const getDistrictContext = cache(async () => {
  const session = await getSession();
  if (!session || session.role !== "DISTRICT_ADMIN") redirect("/login");

  const district = await prisma.district.findFirst({
    where: { admin: { id: session.userId } },
    select: { id: true, name: true, code: true },
  });

  return { session, district };
});