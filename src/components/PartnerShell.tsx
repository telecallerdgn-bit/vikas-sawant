"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, ChevronDown, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import Icon from "@/components/icons";
import PartnerNav from "@/components/PartnerNav";
import LogoutButton from "@/components/LogoutButton";
import { initials } from "@/lib/format";

function SidebarBody({
  name,
  code,
  collapsed = false,
  showLogout = false,
  onNavigate,
}: {
  name: string;
  code: string | null;
  collapsed?: boolean;
  showLogout?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col py-5">
      {/* Brand */}
      <div className={`mb-5 flex items-center gap-3 ${collapsed ? "justify-center" : "px-5"}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-900/40">
          <Icon name="book" className="h-5 w-5" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight text-white">vikas-sawant</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Partner portal</p>
          </div>
        )}
      </div>

      {/* User card */}
      <div className={`mx-3 mb-3 flex items-center gap-3 rounded-2xl bg-white/5 p-2.5 ${collapsed ? "justify-center" : ""}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {initials(name)}
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="truncate font-mono text-xs text-slate-400">{code ?? "No code yet"}</p>
          </div>
        )}
      </div>

      {/* Menu: scrollbar hidden, wheel and touch scroll still work */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <PartnerNav collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      {showLogout && (
        <div className="border-t border-white/10 px-4 pt-4">
          <LogoutButton />
        </div>
      )}
    </div>
  );
}

export default function PartnerShell({
  name,
  code,
  children,
}: {
  name: string;
  code: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("partner-sidebar");
      if (saved) setCollapsed(saved === "collapsed");
    } catch {
      /* storage can be unavailable */
    }
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("partner-sidebar", next ? "collapsed" : "expanded");
    } catch {
      /* ignore */
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/portal";
  }

  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-lato)] text-slate-900">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden bg-[#0b1437] transition-[width] duration-200 lg:block ${
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
        <SidebarBody name={name} code={code} collapsed={collapsed} />
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
              className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-300 hover:bg-white/10"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
            <SidebarBody name={name} code={code} showLogout onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-[76px]" : "lg:pl-64"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="rounded-lg border border-slate-200 p-2 text-slate-700"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold">Partner portal</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/partner/notifications"
              title="Notifications"
              className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
            </Link>

            <div className="relative">
              <button
                type="button"
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

        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}