"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Overview", href: "/admin" },
  { label: "Applications", href: "/admin/applications" },
  { label: "Partners", href: "/admin/partners" },
  { label: "Districts", href: "/admin/districts" },
  { label: "Commission Rules", href: "/admin/commission" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Role Assignments", href: "/admin/roles" },
  { label: "Payouts", href: "/admin/payouts" },
  { label: "Financial Ledger", href: "/admin/ledger" },
  { label: "Shipments", href: "/admin/shipments" },
  { label: "Notification Log", href: "/admin/notifications" },
  { label: "Audit Log", href: "/admin/audit" },
  { label: "System Settings", href: "/admin/settings" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 overflow-y-auto">
      {items.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded px-3 py-2 text-sm ${
              active ? "bg-emerald-100 font-medium text-emerald-900" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}