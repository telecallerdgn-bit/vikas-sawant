"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BellRing,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPin,
  Percent,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { DISPLAY } from "@/lib/ui";

type Item = { label: string; href: string; icon: LucideIcon };

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Main",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "Applications", href: "/admin/applications", icon: ClipboardList },
      { label: "Partners", href: "/admin/partners", icon: Users },
      { label: "Districts", href: "/admin/districts", icon: MapPin },
      { label: "Role Assignments", href: "/admin/roles", icon: ShieldCheck },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { label: "Commission Rules", href: "/admin/commission", icon: Percent },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Payouts", href: "/admin/payouts", icon: Wallet },
      { label: "Financial Ledger", href: "/admin/ledger", icon: BookOpen },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Shipments", href: "/admin/shipments", icon: Truck },
      { label: "Notification Log", href: "/admin/notifications", icon: BellRing },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Audit Log", href: "/admin/audit", icon: ScrollText },
      { label: "System Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

const ALL_ITEMS = GROUPS.flatMap((g) => g.items);

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AdminShell({
  name,
  alerts,
  children,
}: {
  name: string;
  alerts: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin-sidebar");
      if (saved) setCollapsed(saved === "collapsed");
      else if (window.innerWidth < 1024) setCollapsed(true);
    } catch {
      /* storage can be unavailable */
    }
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("admin-sidebar", next ? "collapsed" : "expanded");
    } catch {
      /* ignore */
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/portal";
  }

  const term = q.trim().toLowerCase();
  const results = term ? ALL_ITEMS.filter((i) => i.label.toLowerCase().includes(term)).slice(0, 6) : [];

  function go(href: string) {
    setQ("");
    router.push(href);
  }

  return (
        <div className="flex min-h-screen bg-slate-50 font-[family-name:var(--font-lato)] text-slate-900">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 z-30 flex h-screen shrink-0 flex-col bg-[#0b1437] text-slate-300 transition-[width] duration-200 ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <button
          onClick={toggle}
          aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
          className="absolute -right-3 top-7 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow hover:bg-slate-50"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* Brand */}
        <div className={`flex items-center gap-3 px-4 pb-4 pt-5 ${collapsed ? "justify-center px-0" : ""}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white shadow-lg shadow-blue-900/40">
            <GraduationCap className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className={`${DISPLAY} truncate text-lg font-semibold leading-tight text-white`}>vikas-sawant</p>
              <p className="text-[11px] uppercase tracking-widest text-slate-500">Admin console</p>
            </div>
          )}
        </div>

        {/* User card */}
        <div className={`mx-3 mb-2 flex items-center gap-3 rounded-2xl bg-white/5 p-2.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {initials(name)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{name}</p>
              <p className="text-xs text-slate-500">Full access</p>
            </div>
          )}
        </div>

        {/* Navigation (scrollbar hidden, wheel and touch scroll still work) */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GROUPS.map((g) => (
            <div key={g.label}>
              {collapsed ? (
                <div className="mx-2 my-3 border-t border-white/10" />
              ) : (
                <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  {g.label}
                </p>
              )}
              <div className="space-y-1">
                {g.items.map((item) => {
                  const active =
                    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 rounded-xl py-2.5 text-sm transition ${
                        collapsed ? "justify-center px-0" : "px-3"
                      } ${
                        active
                          ? "bg-blue-600 font-medium text-white shadow-lg shadow-blue-900/40"
                          : "hover:bg-white/10 hover:text-white"
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
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) go(results[0].href);
              }}
              placeholder="Jump to a page..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
            />
            {results.length > 0 && (
              <div className="absolute left-0 right-0 top-11 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                {results.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.href}
                      onClick={() => go(r.href)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50"
                    >
                      <Icon className="h-4 w-4 text-slate-500" />
                      {r.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/notifications?status=FAILED"
              title={alerts > 0 ? `${alerts} failed notifications` : "Notifications"}
              className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
              {alerts > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {alerts > 9 ? "9+" : alerts}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-slate-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {initials(name)}
                </span>
                <span className="hidden text-sm font-medium sm:block">{name}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>

              {menuOpen && (
                <>
                  <button
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-30 cursor-default"
                  />
                  <div className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <button
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

        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}