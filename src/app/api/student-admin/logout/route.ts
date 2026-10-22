import { NextResponse } from "next/server";
import { destroyKindSession } from "@/lib/kind-session";

export async function POST() {
  await destroyKindSession("sadmin");
  return NextResponse.json({ ok: true });
}