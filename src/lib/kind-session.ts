import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type Kind = "student" | "sadmin";
export type KindPayload = { id: number; name: string; kind: Kind };

const COOKIE: Record<Kind, string> = { student: "student_session", sadmin: "sadmin_session" };
const MAX_AGE: Record<Kind, number> = { student: 60 * 60 * 24 * 30, sadmin: 60 * 60 * 8 };

function key(kind: Kind) {
  const base = process.env.JWT_SECRET;
  if (!base) throw new Error("JWT_SECRET is not set");
  // One signing key per kind: a token of one kind can never verify as another
  return new TextEncoder().encode(`${base}|${kind}`);
}

export async function createKindSession(kind: Kind, who: { id: number; name: string }) {
  const token = await new SignJWT({ id: who.id, name: who.name, kind })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + MAX_AGE[kind])
    .sign(key(kind));

  const store = await cookies();
  store.set(COOKIE[kind], token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE[kind],
  });
}

export async function verifyKindToken(kind: Kind, token?: string): Promise<KindPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(kind), { algorithms: ["HS256"] });
    if (payload.kind !== kind || typeof payload.id !== "number") return null;
    return { id: payload.id, name: String(payload.name ?? ""), kind };
  } catch {
    return null;
  }
}

export async function getKindSession(kind: Kind) {
  const store = await cookies();
  return verifyKindToken(kind, store.get(COOKIE[kind])?.value);
}

export async function destroyKindSession(kind: Kind) {
  const store = await cookies();
  store.delete(COOKIE[kind]);
}