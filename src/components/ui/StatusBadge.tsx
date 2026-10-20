import { titleCase } from "@/lib/format";

const RULES: [RegExp, string][] = [
  [/PAID|COMMISSION|CREDIT|BONUS|ACTIVE|DELIVERED/, "bg-emerald-50 text-emerald-700 ring-emerald-200"],
  [/PENDING|REQUESTED|AWAITING/, "bg-amber-50 text-amber-700 ring-amber-200"],
  [/APPROVED|PAYOUT|WITHDRAW|DISPATCH|TRANSIT/, "bg-blue-50 text-blue-700 ring-blue-200"],
  [/FAILED|REJECT|REFUND|REVERSAL|CLAWBACK|DEBIT|RETURN|INACTIVE/, "bg-red-50 text-red-700 ring-red-200"],
];

export default function StatusBadge({ value, label }: { value: string; label?: string }) {
  const key = value.toUpperCase();
  const cls = RULES.find(([re]) => re.test(key))?.[1] ?? "bg-slate-100 text-slate-600 ring-slate-200";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? titleCase(value)}
    </span>
  );
}