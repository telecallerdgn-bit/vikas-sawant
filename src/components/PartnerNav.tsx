"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/icons";

type Item = { label: string; href: string; icon: IconName };

const groups: { title: string; items: Item[] }[] = [
  {
    title: "Main",
    items: [
      { label: "Overview", href: "/partner", icon: "dashboard" },
      { label: "Promote Courses", href: "/partner/courses", icon: "trending" },
    ],
  },
  {
    title: "Growth",
    items: [
      { label: "My Referral Link", href: "/partner/link", icon: "link" },
      { label: "Referral Network", href: "/partner/network", icon: "users" },
      { label: "Enrolments", href: "/partner/enrolments", icon: "bag" },
    ],
  },
  {
    title: "Earnings",
    items: [
      { label: "Commissions", href: "/partner/commissions", icon: "percent" },
      { label: "Wallet Ledger", href: "/partner/ledger", icon: "book" },
      { label: "Withdrawals", href: "/partner/withdrawals", icon: "wallet" },
      { label: "Registration Fees", href: "/partner/fees", icon: "file" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Notifications", href: "/partner/notifications", icon: "bell" },
      { label: "Profile & Bank", href: "/partner/profile", icon: "user" },
      { label: "Support", href: "/partner/support", icon: "help" },
    ],
  },
];

export default function PartnerNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={collapsed ? "space-y-1 pb-6" : "space-y-5 pb-6"}>
      {groups.map((group) => (
        <div key={group.title}>
          {collapsed ? (
            <div className="mx-2 my-3 border-t border-white/10" />
          ) : (
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {group.title}
            </p>
          )}
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active = item.href === "/partner" ? pathname === "/partner" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl py-2.5 text-sm transition-colors ${
                      collapsed ? "justify-center px-0" : "px-3"
                    } ${
                      active
                        ? "bg-blue-600 font-medium text-white shadow-lg shadow-blue-900/40"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
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