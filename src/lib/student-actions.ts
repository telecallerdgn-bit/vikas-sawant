"use server";

import { redirect } from "next/navigation";
import { destroyKindSession } from "@/lib/kind-session";

export async function logoutStudent() {
  await destroyKindSession("student");
  redirect("/");
}