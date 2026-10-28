"use client";

import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { Clock, Mail, Menu, Phone, Search, X } from "lucide-react";

const NAV = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

type Social = { facebook: string; instagram: string; linkedin: string; youtube: string };

type Info = {
  brand: string;
  phone: string;
  email: string;
  hours: string;
  social: Social;
  authDesktop: ReactNode; // top bar ka Login/Register ya logged-in hissa (server se aata hai)
  authMobile: ReactNode; // mobile menu ka Login/Register ya logged-in hissa
};

type ViewProps = Info & {
  pathname: string;
  open: boolean;
  searchOpen: boolean;
  onToggle: () => void;
  onSearch: () => void;
  onClose: () => void;
};

type SocialKey = keyof Social;

// Brand icons are drawn here because newer lucide-react versions no longer include them.
function SocialIcon({ name }: { name: SocialKey }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-4 w-4",
    "aria-hidden": true,
  };

  switch (name) {
    case "facebook":
      return (
        <svg {...common}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <path d="m10 15 5-3-5-3z" />
        </svg>
      );
  }
}

function HeaderView({
  brand,
  phone,
  email,
  hours,
  social,
  authDesktop,
  authMobile,
  pathname,
  open,
  searchOpen,
  onToggle,
  onSearch,
  onClose,
}: ViewProps) {
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // The type is written on the full list first. If it is written only on the result of .filter(),
  // TypeScript reads each "key" as a plain string and refuses to match it with SocialKey.
  const allSocials: { key: SocialKey; label: string; href: string }[] = [
    { key: "facebook", label: "Facebook", href: social.facebook },
    { key: "instagram", label: "Instagram", href: social.instagram },
    { key: "linkedin", label: "LinkedIn", href: social.linkedin },
    { key: "youtube", label: "YouTube", href: social.youtube },
  ];
  const socials = allSocials.filter((s) => /^https?:\/\//i.test(s.href));

  return (
    <>
      {/* Top bar. It scrolls away; only the menu below stays on screen. */}
      <div className="bg-gold-400 text-brand-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 pl-4">
          <ul className="flex min-w-0 items-center divide-x divide-brand-900/20 text-xs font-semibold sm:text-sm">
            {phone && (
              <li className="py-2.5 pr-4">
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 hover:underline">
                  <Phone className="h-4 w-4 shrink-0" />
                  {phone}
                </a>
              </li>
            )}
            {email && (
              <li className="hidden py-2.5 pl-4 pr-4 md:block">
                <a href={`mailto:${email}`} className="flex items-center gap-2 hover:underline">
                  <Mail className="h-4 w-4 shrink-0" />
                  {email}
                </a>
              </li>
            )}
            {hours && (
              <li className="hidden items-center gap-2 py-2.5 pl-4 lg:flex">
                <Clock className="h-4 w-4 shrink-0" />
                {hours}
              </li>
            )}
          </ul>

          <div className="flex items-center">
            {socials.length > 0 && (
              <div className="mr-5 hidden items-center gap-3 lg:flex">
                <span className="text-sm font-semibold">Follow Us:</span>
                {socials.map(({ key, label, href }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="hover:opacity-70"
                  >
                    <SocialIcon name={key} />
                  </a>
                ))}
              </div>
            )}

            {authDesktop}
          </div>
        </div>
      </div>

      {/* Main menu. Sticky, so it stays at the top while scrolling. */}
      <header className="sticky top-0 z-40 border-b-2 border-gold-400 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
          <Link href="/" onClick={onClose} className="flex items-center">
            <Image src="/logo.webp" alt={brand} width={360} height={370} priority className="h-14 w-auto" />
          </Link>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide transition ${
                    active(n.href) ? "bg-brand-900 text-white" : "text-brand-900 hover:bg-gold-100"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={onSearch}
              aria-label={searchOpen ? "Close search" : "Search courses"}
              aria-expanded={searchOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 text-brand-900 transition hover:bg-gold-100"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={onToggle}
              aria-label="Menu"
              aria-expanded={open}
              className="rounded-lg border border-brand-100 p-2 text-brand-900 md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-brand-100 bg-white px-4 py-3">
            <Form action="/courses" onSubmit={onSearch} className="mx-auto flex max-w-6xl gap-2">
              <input
                name="q"
                autoFocus
                placeholder="Search courses"
                aria-label="Search courses"
                className="w-full rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm outline-none focus:border-gold-500"
              />
              <button className="rounded-full bg-gold-400 px-6 py-2.5 text-sm font-bold text-brand-900 hover:bg-gold-300">
                Search
              </button>
            </Form>
          </div>
        )}

        {open && (
          <div className="space-y-1 border-t border-brand-100 bg-white px-4 py-3 md:hidden">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={onClose}
                className={`block rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-wide ${
                  active(n.href) ? "bg-brand-900 text-white" : "text-brand-900"
                }`}
              >
                {n.label}
              </Link>
            ))}
            {/* Slot ke andar kisi bhi link par click karne se mobile menu band ho jata hai */}
            <div onClick={onClose}>{authMobile}</div>

            {socials.length > 0 && (
              <div className="flex items-center gap-4 pt-3 text-brand-900">
                {socials.map(({ key, label, href }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="rounded-full border border-brand-100 p-2.5 hover:bg-gold-100"
                  >
                    <SocialIcon name={key} />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}

// usePathname() is only known per request, so it lives in its own component
// and is wrapped in Suspense below.
function HeaderLive(props: Info) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <HeaderView
      {...props}
      pathname={pathname}
      open={open}
      searchOpen={searchOpen}
      onToggle={() => {
        setOpen((o) => !o);
        setSearchOpen(false);
      }}
      onSearch={() => {
        setSearchOpen((s) => !s);
        setOpen(false);
      }}
      onClose={() => {
        setOpen(false);
        setSearchOpen(false);
      }}
    />
  );
}

export default function SiteHeaderClient(props: Info) {
  return (
    // The fallback shows the same header (only the active tab is not highlighted), so the page does not jump
    <Suspense
      fallback={
        <HeaderView
          {...props}
          pathname=""
          open={false}
          searchOpen={false}
          onToggle={() => {}}
          onSearch={() => {}}
          onClose={() => {}}
        />
      }
    >
      <HeaderLive {...props} />
    </Suspense>
  );
}