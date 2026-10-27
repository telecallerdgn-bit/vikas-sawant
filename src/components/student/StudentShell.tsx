"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  PlayCircle,
  ShoppingBag,
  Truck,
  User,
  Video,
  X,
} from "lucide-react";

type Item = { label: string; href?: string; icon: LucideIcon };

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Learning",
    items: [
      { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
      { label: "My Courses", href: "/student/courses", icon: BookOpen },
    ],
  },
  {
    label: "Learn",
    items: [
      { label: "Recorded Lessons", href: "/student/recorded", icon: PlayCircle },
      { label: "Live Classes", href: "/student/live", icon: Video },
      { label: "Study Materials", href: "/student/materials", icon: FileText },
    ],
  },
  {
    label: "Orders",
    items: [
      { label: "My Orders", href: "/student/orders", icon: ShoppingBag },
      { label: "Book Tracking", href: "/student/tracking", icon: Truck },
      { label: "Notifications", href: "/student/notifications", icon: Bell },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "My Profile", href: "/student/profile", icon: User },
      { label: "Help & Support", href: "/student/support", icon: LifeBuoy },
    ],
  },
  {
    label: "Coming soon",
    items: [{ label: "Tests & Assignments", icon: ClipboardCheck }],
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function SidebarBody({
  name,
  mobile,
  collapsed,
  onNavigate,
}: {
  name: string;
  mobile: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col py-5">
      <div className={`mb-4 flex items-center gap-3 ${collapsed ? "justify-center" : "px-5"}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f8b915] text-[#0b2149] shadow-lg shadow-black/20">
          <GraduationCap className="h-6 w-6" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight text-white">vikas-sawant</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#f8b915]">Student</p>
          </div>
        )}
      </div>

      <div className={`mx-3 mb-2 flex items-center gap-3 rounded-2xl bg-white/10 p-2.5 ${collapsed ? "justify-center" : ""}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f8b915] text-sm font-bold text-[#0b2149]">
          {initials(name)}
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="truncate text-xs text-slate-300">{mobile}</p>
          </div>
        )}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GROUPS.map((g) => (
          <div key={g.label}>
            {collapsed ? (
              <div className="mx-2 my-3 border-t border-white/10" />
            ) : (
              <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                {g.label}
              </p>
            )}
            <div className="space-y-1">
              {g.items.map((item) => {
                const Icon = item.icon;
                const base = `flex items-center gap-3 rounded-xl py-2.5 text-sm transition ${
                  collapsed ? "justify-center px-0" : "px-3"
                }`;

                if (!item.href) {
                  return (
                    <div
                      key={item.label}
                      title={collapsed ? `${item.label} (soon)` : undefined}
                      className={`${base} cursor-not-allowed text-slate-500`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="truncate">{item.label}</span>
                          <span className="ml-auto rounded-full bg-white/10 px-2 text-[10px] font-semibold uppercase text-slate-400">
                            Soon
                          </span>
                        </>
                      )}
                    </div>
                  );
                }

                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={`${base} ${
                      active
                        ? "bg-[#f8b915] font-bold text-[#0b2149] shadow-lg shadow-black/20"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

export default function StudentShell({
  name,
  mobile,
  children,
}: {
  name: string;
  mobile: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("student-sidebar") === "collapsed") setCollapsed(true);
    } catch {
      /* storage can be unavailable */
    }
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("student-sidebar", next ? "collapsed" : "expanded");
    } catch {
      /* ignore */
    }
  }

  async function logout() {
    await fetch("/api/student/logout", { method: "POST" });
    window.location.href = "/student/login";
  }

  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-lato)] text-slate-900">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden bg-[#0b2149] transition-[width] duration-200 lg:block ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
          className="absolute -right-3 top-7 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow hover:bg-slate-50"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <SidebarBody name={name} mobile={mobile} collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-[#0b2149] shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-300 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarBody name={name} mobile={mobile} collapsed={false} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-[76px]" : "lg:pl-64"}`}>
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="rounded-lg border border-slate-200 p-2 text-slate-700"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm font-bold text-[#0b2149]">Student</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:flex"
            >
              <Globe className="h-4 w-4" />
              Website
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-slate-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b2149] text-xs font-bold text-white">
                  {initials(name)}
                </span>
                <span className="hidden text-sm font-semibold sm:block">{name}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-30 cursor-default"
                  />
                  <div className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}