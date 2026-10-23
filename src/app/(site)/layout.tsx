import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fff8f1] font-[family-name:var(--font-lato)] text-slate-800">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}