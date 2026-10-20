import Icon from "@/components/icons";

export default function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700">
      <Icon name="info" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-600" />
      <p>{children}</p>
    </div>
  );
}