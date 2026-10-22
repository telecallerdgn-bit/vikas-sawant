"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/icons";
import type { GroupKey } from "@/lib/packing";
import { PACKING_BASE } from "@/lib/routes";

type Tone = "amber" | "red" | "neutral";
export type NavItem = { label: string; path: string; icon: IconName; key: GroupKey; tone: Tone };

// PackingShell ka "Jump to a page" search bhi isi list ko use karta hai
export const NAV_ITEMS: NavItem[] = [
  { label: "Packing Queue", path: "", icon: "package", key: "queue", tone: "amber" },
  { label: "Packed · Create Shipment", path: "/packed", icon: "check", key: "packed", tone: "amber" },
  { label: "Shipping Labels", path: "/labels", icon: "file", key: "labels", tone: "neutral" },
  { label: "In Transit", path: "/in-transit", icon: "truck", key: "transit", tone: "neutral" },
  { label: "Delivered", path: "/delivered", icon: "userCheck", key: "delivered", tone: "neutral" },
  { label: "Delivery Exceptions", path: "/exceptions", icon: "alert", key: "exceptions", tone: "red" },
];

const BADGE: Record<Tone, string> = {
  amber: "bg-amber-400/20 text-amber-300",
  red: "bg-red-500/25 text-red-300",
  neutral: "bg-white/10 text-slate-300",
};

// Sidebar band hone par count ek chhote dot me icon ke upar dikhta hai
const DOT: Record<Tone, string> = {
  amber: "bg-amber-400 text-slate-900",
  red: "bg-red-500 text-white",
  neutral: "bg-slate-500 text-white",
};

export default function PackingNav({
  counts,
  collapsed = false,
  onNavigate,
}: {
  counts: Record<GroupKey, number>;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="pb-6">
      {collapsed ? (
        <div className="mx-3 mb-2 border-t border-white/10" />
      ) : (
        <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Dispatch</p>
      )}

      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const href = `${PACKING_BASE}${item.path}`;
          const active = item.path === "" ? pathname === PACKING_BASE : pathname.startsWith(href);
          const count = counts[item.key];
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                title={collapsed ? `${item.label}${count > 0 ? ` (${count})` : ""}` : undefined}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  collapsed ? "justify-center px-0" : "px-3"
                } ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon name={item.icon} className="h-5 w-5 shrink-0" />

                {!collapsed && <span className="flex-1">{item.label}</span>}

                {count > 0 &&
                  (collapsed ? (
                    <span
                      className={`absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums ${DOT[item.tone]}`}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  ) : (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                        active ? "bg-white/25 text-white" : BADGE[item.tone]
                      }`}
                    >
                      {count}
                    </span>
                  ))}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}