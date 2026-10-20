import { Suspense } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock, HelpCircle, Mail, MessageCircle, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const FAQS = [
  {
    q: "Where do I find my referral code and link?",
    a: "Open My Referral Link from the menu. Your code is also shown on Overview and in Profile & Bank. Share the link or the code, and anyone who joins through it is linked to you.",
  },
  {
    q: "When does my commission show up?",
    a: "Commission is credited when a student you referred buys a course. It then appears under Commissions and Wallet Ledger.",
  },
  {
    q: "How do I withdraw my earnings?",
    a: "Save your bank account in Profile & Bank, then use Withdrawals to request a payout. The admin team reviews it, and the bank reference (UTR) appears there once it is paid.",
  },
  {
    q: "Why is my account not active yet?",
    a: "A partner account becomes active only when the application is approved and the registration & training fee is confirmed. You can see both steps under Registration Fees.",
  },
  {
    q: "How can I change my name, email or mobile number?",
    a: "These can only be changed by the admin team. Contact support using any option on this page.",
  },
];

function digits(v: string | undefined) {
  return (v ?? "").replace(/\D/g, "");
}

function Channel({
  icon: Icon,
  title,
  value,
  href,
  action,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  value: string | null;
  href: string | null;
  action: string;
  tone: { card: string; icon: string; label: string; btn: string };
}) {
  return (
    <div className={`flex flex-col rounded-2xl border bg-gradient-to-br p-5 ${tone.card}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
        <p className={`text-xs font-semibold uppercase tracking-wider ${tone.label}`}>{title}</p>
      </div>

      <p className="mt-4 break-all text-lg font-semibold text-slate-900">
        {value ?? <span className="text-slate-400">Not set up yet</span>}
      </p>

      <div className="mt-4">
        {href ? (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={`inline-block rounded-xl px-4 py-2 text-sm font-medium text-white ${tone.btn}`}
          >
            {action}
          </a>
        ) : (
          <span className="inline-block cursor-not-allowed rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500">
            {action}
          </span>
        )}
      </div>
    </div>
  );
}

async function SupportView() {
  const session = await getSession();
  const me = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, referralCode: true },
      })
    : null;

  const email = process.env.SUPPORT_EMAIL?.trim() || null;
  const phoneDigits = digits(process.env.SUPPORT_PHONE);
  const waDigits = digits(process.env.SUPPORT_WHATSAPP);
  const hours = process.env.SUPPORT_HOURS?.trim() || null;

  const subject = encodeURIComponent(
    `Partner support: ${me?.name ?? "Partner"}${me?.referralCode ? ` (${me.referralCode})` : ""}`
  );
  const waNumber = waDigits.length === 10 ? `91${waDigits}` : waDigits;
  const waText = encodeURIComponent(
    `Hi, I need help. Partner: ${me?.name ?? ""}${me?.referralCode ? `, code ${me.referralCode}` : ""}.`
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Channel
          icon={Mail}
          title="Email us"
          value={email}
          href={email ? `mailto:${email}?subject=${subject}` : null}
          action="Send an email"
          tone={{
            card: "border-sky-100 from-sky-50 to-blue-100/70",
            icon: "bg-blue-500 text-white",
            label: "text-blue-700",
            btn: "bg-blue-600 hover:bg-blue-700",
          }}
        />
        <Channel
          icon={Phone}
          title="Call us"
          value={phoneDigits ? process.env.SUPPORT_PHONE!.trim() : null}
          href={phoneDigits ? `tel:+${phoneDigits.length === 10 ? "91" : ""}${phoneDigits}` : null}
          action="Call now"
          tone={{
            card: "border-violet-100 from-violet-50 to-purple-100/70",
            icon: "bg-violet-500 text-white",
            label: "text-violet-700",
            btn: "bg-violet-600 hover:bg-violet-700",
          }}
        />
        <Channel
          icon={MessageCircle}
          title="WhatsApp"
          value={waDigits ? process.env.SUPPORT_WHATSAPP!.trim() : null}
          href={waDigits ? `https://wa.me/${waNumber}?text=${waText}` : null}
          action="Chat on WhatsApp"
          tone={{
            card: "border-emerald-100 from-emerald-50 to-green-100/70",
            icon: "bg-emerald-500 text-white",
            label: "text-emerald-700",
            btn: "bg-emerald-600 hover:bg-emerald-700",
          }}
        />
      </div>

      {hours && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <Clock className="h-[18px] w-[18px]" />
          </span>
          <p>
            <span className="font-semibold">Support hours:</span> {hours}
          </p>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <HelpCircle className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-semibold text-slate-900">Frequently asked questions</h2>
        </div>

        <div className="divide-y divide-slate-100 border-t border-slate-100">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-xl leading-none text-slate-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {me?.referralCode && (
        <p className="text-center text-xs text-slate-500">
          Mention your partner code <span className="font-mono font-medium text-slate-700">{me.referralCode}</span>{" "}
          when you contact us, it helps us find your account quickly.
        </p>
      )}
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Partner portal</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Support</h1>
        <p className="mt-1 text-sm text-slate-500">Questions about your account, earnings or payouts? We are here.</p>
      </header>

      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <SupportView />
      </Suspense>
    </div>
  );
}