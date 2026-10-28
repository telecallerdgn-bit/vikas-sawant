import Link from "next/link";
import { Suspense } from "react";
import { User } from "lucide-react";
import { SITE } from "@/lib/site-config";
import SiteHeaderClient from "@/components/site/SiteHeaderClient";
import HeaderAuth, { AuthSkeleton } from "@/components/site/HeaderAuth";

// Purana Login / Register block. Ye "guest" hai: login nahi hone par HeaderAuth yahi dikhata hai.
const guestDesktop = (
  <div className="flex items-center gap-2 self-stretch bg-brand-900 px-4 text-sm font-semibold text-white sm:px-6">
    <User className="h-4 w-4 shrink-0" />
    <Link href="/student/login" className="py-2.5 hover:text-gold-300">
      Login
    </Link>
    <span className="text-white/50">/</span>
    <Link href="/student/register" className="py-2.5 hover:text-gold-300">
      Register
    </Link>
  </div>
);

const guestMobile = (
  <div className="flex gap-2 pt-2">
    <Link
      href="/student/login"
      className="flex-1 rounded-xl border border-brand-200 py-2.5 text-center text-sm font-semibold text-brand-900"
    >
      Login
    </Link>
    <Link
      href="/student/register"
      className="flex-1 rounded-xl bg-gold-400 py-2.5 text-center text-sm font-bold text-brand-900"
    >
      Register
    </Link>
  </div>
);

export default function SiteHeader() {
  const phone = process.env.SUPPORT_PHONE?.trim() ?? "";
  const email = process.env.SUPPORT_EMAIL?.trim() ?? "";

  return (
    <SiteHeaderClient
      brand={SITE.brand}
      phone={phone}
      email={email}
      hours={SITE.hours}
      social={SITE.social}
      // Cookie padhne wala HeaderAuth Suspense ke andar hona zaroori hai (Cache Components)
      authDesktop={
        <Suspense fallback={<AuthSkeleton />}>
          <HeaderAuth guest={guestDesktop} />
        </Suspense>
      }
      authMobile={
        <Suspense fallback={<div className="mt-2 h-11 animate-pulse rounded-xl bg-brand-50" />}>
          <HeaderAuth guest={guestMobile} />
        </Suspense>
      }
    />
  );
}