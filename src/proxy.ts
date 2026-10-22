import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/session";
import { roleHome } from "@/lib/roles";

const protectedPrefixes: Record<string, string> = {
  "/admin": "ADMIN",
  "/partner": "PARTNER",
  "/district": "DISTRICT_ADMIN",
  "/sub-super": "SUB_SUPER",
  "/finance": "FINANCE",
  "/packing": "PACKING",
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifyToken(req.cookies.get("session")?.value);

  const entry = Object.entries(protectedPrefixes).find(
    ([p]) => pathname === p || pathname.startsWith(p + "/")
  );

  if (entry) {
    if (!session) return NextResponse.redirect(new URL("/portal", req.url));
    if (session.role !== entry[1]) {
      return NextResponse.redirect(new URL(roleHome[session.role] ?? "/portal", req.url));
    }
  }

  if ((pathname === "/login" || pathname === "/portal") && session) {
    return NextResponse.redirect(new URL(roleHome[session.role] ?? "/portal", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/portal",
    "/admin/:path*",
    "/partner/:path*",
    "/district/:path*",
    "/sub-super/:path*",
    "/finance/:path*",
    "/packing/:path*",
  ],
};