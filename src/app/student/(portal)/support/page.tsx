import { Suspense } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { requireStudent } from "@/lib/student-auth";
import { PageTitle } from "@/components/student/ui";

const FAQS = [
  {
    q: "When will my books reach me?",
    a: "If your course includes study material, the parcel is packed after your order is paid. Follow every step under Book Tracking. Make sure your address is saved in My Profile.",
  },
  {
    q: "I paid but my order shows Payment pending.",
    a: "Contact us with your order number from My Orders. We will check the payment and update it.",
  },
  {
    q: "How do I change my mobile number?",
    a: "Your mobile number is your login, so only our team can change it. Contact support using any option on this page.",
  },
  {
    q: "I forgot my password.",
    a: "Contact support and our team will set a new password for you. After you log in you can change it from My Profile.",
  },
];

const digits = (v?: string) => (v ?? "").replace(/\D/g, "");

function Channel({
  icon: Icon,
  title,
  value,
  href,
  action,
}: {
  icon: LucideIcon;
  title: string;
  value: string | null;
  href: string | null;
  action: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8b915] text-[#0b2149]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-1 break-all font-semibold text-slate-900">
        {value ?? <span className="text-slate-400">Not set up yet</span>}
      </p>
      {href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-full bg-[#0b2149] px-5 py-2 text-sm font-bold text-white hover:bg-[#16346b]"
        >
          {action}
        </a>
      ) : (
        <span className="mt-4 inline-block cursor-not-allowed rounded-full bg-slate-200 px-5 py-2 text-sm font-bold text-slate-500">
          {action}
        </span>
      )}
    </div>
  );
}

async function View() {
  const me = await requireStudent();

  const email = process.env.SUPPORT_EMAIL?.trim() || null;
  const phone = digits(process.env.SUPPORT_PHONE);
  const wa = digits(process.env.SUPPORT_WHATSAPP);
  const hours = process.env.SUPPORT_HOURS?.trim() || null;

  const subject = encodeURIComponent(`Student support: ${me.name} (${me.mobile})`);
  const waText = encodeURIComponent(`Hi, I need help. Student: ${me.name}, mobile ${me.mobile}.`);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Channel
          icon={Mail}
          title="Email"
          value={email}
          href={email ? `mailto:${email}?subject=${subject}` : null}
          action="Send an email"
        />
        <Channel
          icon={Phone}
          title="Call"
          value={phone ? process.env.SUPPORT_PHONE!.trim() : null}
          href={phone ? `tel:+${phone.length === 10 ? "91" : ""}${phone}` : null}
          action="Call now"
        />
        <Channel
          icon={MessageCircle}
          title="WhatsApp"
          value={wa ? process.env.SUPPORT_WHATSAPP!.trim() : null}
          href={wa ? `https://wa.me/${wa.length === 10 ? `91${wa}` : wa}?text=${waText}` : null}
          action="Chat on WhatsApp"
        />
      </div>

      {hours && (
        <p className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <Clock className="h-4 w-4 text-[#a66e00]" />
          <span>
            <b>Support hours:</b> {hours}
          </span>
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white">
        <h2 className="px-5 py-4 text-lg font-bold text-[#0b2149]">Common questions</h2>
        <div className="divide-y divide-slate-100 border-t border-slate-100">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-xl leading-none text-slate-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function StudentSupportPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Help & Support" subtitle="Questions about your course, order or account?" />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}