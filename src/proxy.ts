import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/session";
import { roleHome } from "@/lib/roles";

const protectedPrefixes: Record<string, string> = {
  "/admin": "ADMIN",
  "/student": "STUDENT",
  "/partner": "PARTNER",
  "/district": "DISTRICT_ADMIN",
  "/sub-super": "SUB_SUPER",
  "/finance": "FINANCE",
  "/packing": "PACKING",
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifyToken(req.cookies.get("session")?.value);

  const entry = Object.entries(protectedPrefixes).find(([p]) => pathname.startsWith(p));

  if (entry) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));
    if (session.role !== entry[1]) {
      return NextResponse.redirect(new URL(roleHome[session.role] ?? "/login", req.url));
    }
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL(roleHome[session.role] ?? "/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/student/:path*", "/partner/:path*", "/district/:path*", "/sub-super/:path*", "/finance/:path*", "/packing/:path*"],
};