"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { Menu, X } from "lucide-react";
import { SITE } from "@/lib/site-config";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

function HeaderView({
  pathname,
  open,
  onToggle,
  onClose,
}: {
  pathname: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b-2 border-gold-400 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <Link href="/" onClick={onClose} className="flex items-center gap-3">
          <Image
            src="/logo.webp"
            alt={SITE.brand}
            width={360}
            height={370}
            priority
            className="h-14 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active(n.href) ? "bg-brand-900 text-white" : "text-brand-900 hover:bg-gold-100"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/student/login" className="text-sm font-semibold text-brand-900 hover:text-brand-600">
            Login
          </Link>
          <Link
            href="/student/register"
            className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-bold text-brand-900 shadow-md shadow-gold-500/30 hover:bg-gold-300"
          >
            Register
          </Link>
        </div>

        <button
          onClick={onToggle}
          aria-label="Menu"
          aria-expanded={open}
          className="rounded-lg border border-brand-100 p-2 text-brand-900 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="space-y-1 border-t border-brand-100 bg-white px-4 py-3 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={onClose}
              className={`block rounded-xl px-4 py-2.5 text-sm font-semibold ${
                active(n.href) ? "bg-brand-900 text-white" : "text-brand-900"
              }`}
            >
              {n.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Link
              href="/student/login"
              onClick={onClose}
              className="flex-1 rounded-xl border border-brand-200 py-2.5 text-center text-sm font-semibold text-brand-900"
            >
              Login
            </Link>
            <Link
              href="/student/register"
              onClick={onClose}
              className="flex-1 rounded-xl bg-gold-400 py-2.5 text-center text-sm font-bold text-brand-900"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// usePathname() sirf request ke waqt pata chalta hai, isliye ise alag component me
// rakh kar neeche Suspense me lapeta gaya hai.
function HeaderLive() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <HeaderView
      pathname={pathname}
      open={open}
      onToggle={() => setOpen((o) => !o)}
      onClose={() => setOpen(false)}
    />
  );
}

export default function SiteHeader() {
  return (
    // Fallback me wahi header dikhta hai (bas active tab highlight nahi), to page hilta nahi
    <Suspense fallback={<HeaderView pathname="" open={false} onToggle={() => {}} onClose={() => {}} />}>
      <HeaderLive />
    </Suspense>
  );
}