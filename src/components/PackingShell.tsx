"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "@/components/icons";
import PackingNav, { NAV_ITEMS } from "@/components/PackingNav";
import { initials } from "@/lib/format";
import type { GroupKey } from "@/lib/packing";
import { PACKING_BASE } from "@/lib/routes";

type Counts = Record<GroupKey, number>;

const STORAGE_KEY = "packingSidebarCollapsed";

// Chhote inline icons, taaki icons.tsx me naye naam na jodne padein
function Glyph({ name, className = "h-4 w-4" }: { name: "chevronLeft" | "chevronDown" | "search" | "logout"; className?: string }) {
  const paths = {
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function SidebarBody({
  name,
  place,
  counts,
  collapsed = false,
  onNavigate,
}: {
  name: string;
  place: string | null;
  counts: Counts;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col px-4 py-5">
      {/* Brand */}
      <div className={`mb-5 flex items-center gap-3 ${collapsed ? "justify-center" : "px-1"}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <Icon name="package" className="h-5 w-5" />
        </span>
        {!collapsed && (
          <div>
            <p className="text-[15px] font-semibold leading-tight text-white">vikas-sawant</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Packing department</p>
          </div>
        )}
      </div>

      {/* User card */}
      <div className={`mb-5 flex items-center gap-3 rounded-xl bg-white/5 ${collapsed ? "justify-center p-2" : "p-3"}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {initials(name)}
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="truncate text-xs text-slate-400">Dispatch desk{place ? ` · ${place}` : ""}</p>
          </div>
        )}
      </div>

      <div className="-mx-1 flex-1 overflow-y-auto px-1">
        <PackingNav counts={counts} collapsed={collapsed} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export default function PackingShell({
  name,
  place,
  counts,
  children,
}: {
  name: string;
  place: string | null;
  counts: Counts;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop sidebar
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Pichli baar ka sidebar state yaad rakho
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* storage blocked ho to chalega */
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      try {
        localStorage.setItem(STORAGE_KEY, c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });
  }

  function jump(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    const hit = NAV_ITEMS.find((i) => i.label.toLowerCase().includes(q));
    if (hit) {
      router.push(`${PACKING_BASE}${hit.path}`);
      setQuery("");
    }
  }

  async function logout() {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden bg-[#0b1437] transition-all duration-200 lg:block ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow hover:bg-slate-50"
        >
          <Glyph name="chevronLeft" className={`h-3.5 w-3.5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
        <SidebarBody name={name} place={place} counts={counts} collapsed={collapsed} />
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
          <div className="absolute inset-y-0 left-0 w-72 bg-[#0b1437] shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-300 hover:bg-white/10"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
            <SidebarBody name={name} place={place} counts={counts} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className={`transition-all duration-200 ${collapsed ? "lg:pl-[76px]" : "lg:pl-64"}`}>
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>

          <form onSubmit={jump} className="relative w-full max-w-sm">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Glyph name="search" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Jump to a page..."
              aria-label="Jump to a page"
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15"
            />
          </form>

          <div className="ml-auto flex items-center gap-2">
            {place && (
              <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 sm:inline">
                {place}
              </span>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {initials(name)}
                </span>
                <span className="hidden text-sm font-medium text-slate-700 sm:inline">{name}</span>
                <Glyph name="chevronDown" className="h-4 w-4 text-slate-400" />
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Glyph name="logout" />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}