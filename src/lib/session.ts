import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

const COOKIE = "session";

// Secret ko tab padhte hain jab zarurat ho, taaki missing secret saaf error de
// (khali key se login chupchap fail hota rehta hai).
function getSecret() {
  const raw = process.env.JWT_SECRET;
  if (!raw) throw new Error("JWT_SECRET is not set. Add it to your .env file.");
  if (raw.length < 32 && process.env.NODE_ENV === "production") {
    console.warn("[session] JWT_SECRET is shorter than 32 characters. Use a longer random value.");
  }
  return new TextEncoder().encode(raw);
}

export type SessionPayload = {
  userId: number;
  role: string;
  name: string;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/** Sirf token check karta hai (database nahi). proxy.ts jaisi jagah ke liye halka rakha hai. */
export async function verifyToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Token ke saath database bhi dekhta hai:
 * - suspend ya inactive user turant bahar ho jata hai
 * - role badalne par naya role turant lagta hai (token ka purana role nahi)
 * Ek request me kai baar bulane par query sirf ek baar chalti hai (cache).
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const store = await cookies();
  const payload = await verifyToken(store.get(COOKIE)?.value);
  if (!payload) return null;

  // Dynamic import: proxy.ts sirf verifyToken use kare to prisma load na ho
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) return null;

  return { userId: user.id, role: user.role, name: user.name };
});

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}