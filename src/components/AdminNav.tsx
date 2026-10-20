"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/icons";

type Item = { label: string; href: string; icon: IconName };

const groups: { title: string; items: Item[] }[] = [
  {
    title: "Main",
    items: [{ label: "Overview", href: "/admin", icon: "dashboard" }],
  },
  {
    title: "People",
    items: [
      { label: "Applications", href: "/admin/applications", icon: "file" },
      { label: "Partners", href: "/admin/partners", icon: "users" },
      { label: "Districts", href: "/admin/districts", icon: "mapPin" },
      { label: "Role Assignments", href: "/admin/roles", icon: "shield" },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: "bag" },
      { label: "Commission Rules", href: "/admin/commission", icon: "percent" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Payouts", href: "/admin/payouts", icon: "wallet" },
      { label: "Financial Ledger", href: "/admin/ledger", icon: "book" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Shipments", href: "/admin/shipments", icon: "truck" },
      { label: "Notification Log", href: "/admin/notifications", icon: "bell" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Audit Log", href: "/admin/audit", icon: "clipboard" },
      { label: "System Settings", href: "/admin/settings", icon: "settings" },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-5 overflow-y-auto pb-6">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-brand-400">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-brand-700 font-medium text-white shadow-sm before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-1 before:rounded-r-full before:bg-gold-400"
                        : "text-gray-600 hover:bg-brand-50 hover:text-brand-800"
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                        active ? "text-gold-400" : "text-gray-400 group-hover:text-brand-600"
                      }`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}