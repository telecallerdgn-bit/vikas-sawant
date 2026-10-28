import { redirect } from "next/navigation";
import { getKindSession } from "@/lib/kind-session";

/**
 * Login ya register page par logged-in student ko seedha dashboard bhej deta hai.
 * Cookie padhta hai, isliye ise hamesha <Suspense fallback={null}> ke andar lagana hai (Cache Components).
 */
export default async function RedirectIfSignedIn() {
  const session = await getKindSession("student");
  if (session) redirect("/student/dashboard");
  return null;
}