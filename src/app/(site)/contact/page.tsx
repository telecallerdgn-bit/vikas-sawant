import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock, Handshake, Mail, MessageCircle, Phone } from "lucide-react";
import { SITE } from "@/lib/site-config";
import ContactForm from "@/components/site/ContactForm";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/site/Reveal";

export const metadata = { title: `Contact | ${SITE.brand}` };

const digits = (v?: string) => (v ?? "").replace(/\D/g, "");

export default function ContactPage() {
  const email = process.env.SUPPORT_EMAIL?.trim() || null;
  const phone = digits(process.env.SUPPORT_PHONE);
  const wa = digits(process.env.SUPPORT_WHATSAPP);
  const hours = process.env.SUPPORT_HOURS?.trim() || null;

  const cards = [
    email && {
      icon: Mail,
      title: "Email us",
      value: email,
      href: `mailto:${email}`,
      action: "Send an email",
    },
    phone && {
      icon: Phone,
      title: "Call us",
      value: process.env.SUPPORT_PHONE!.trim(),
      href: `tel:+${phone.length === 10 ? "91" : ""}${phone}`,
      action: "Call now",
    },
    wa && {
      icon: MessageCircle,
      title: "WhatsApp",
      value: process.env.SUPPORT_WHATSAPP!.trim(),
      href: `https://wa.me/${wa.length === 10 ? `91${wa}` : wa}`,
      action: "Chat on WhatsApp",
    },
  ].filter(Boolean) as { icon: typeof Mail; title: string; value: string; href: string; action: string }[];

  return (
    <main className="bg-white">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        badge={{ icon: MessageCircle, label: "We are here" }}
        title="Contact us"
        text="Questions about a course, an order or becoming a partner? Reach out."
        decor={[Mail, Phone, MessageCircle, Clock]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.3fr]">
          {/* Contact details */}
          <div className="space-y-4">
            {cards.length === 0 ? (
              <Reveal>
                <p className="rounded-3xl border border-dashed border-brand-200 bg-brand-50/60 p-8 text-center text-slate-500">
                  Contact details will be available soon. You can still send us a message using the form.
                </p>
              </Reveal>
            ) : (
              cards.map((c, i) => {
                const Icon = c.icon;
                const external = c.href.startsWith("http");
                return (
                  <Reveal key={c.title} delay={i * 110}>
                    <a
                      href={c.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-brand-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gold-400 hover:shadow-xl"
                    >
                      <Icon className="pointer-events-none absolute -bottom-5 -right-5 h-24 w-24 text-brand-50 transition duration-300 group-hover:rotate-12 group-hover:text-gold-400/20" />

                      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-900 text-gold-400 shadow-lg shadow-brand-900/20 transition duration-300 group-hover:-rotate-6">
                        <Icon className="h-7 w-7" />
                      </span>
                      <div className="relative min-w-0 flex-1">
                        <h3 className="font-bold text-brand-900">{c.title}</h3>
                        <p className="break-all text-sm text-slate-600">{c.value}</p>
                        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-4 py-1.5 text-sm font-bold text-brand-900 transition group-hover:bg-brand-900 group-hover:text-white">
                          {c.action}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <span className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-gold-400 transition-all duration-300 group-hover:w-2/3" />
                    </a>
                  </Reveal>
                );
              })
            )}

            {hours && (
              <Reveal delay={cards.length * 110}>
                <p className="flex items-center gap-3 rounded-2xl bg-gold-100/60 px-4 py-3 text-sm text-brand-900">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400">
                    <Clock className="h-4 w-4" />
                  </span>
                  <span>
                    <b>Support hours:</b> {hours}
                  </span>
                </p>
              </Reveal>
            )}

            {/* Partner call-out */}
            <Reveal delay={(cards.length + 1) * 110}>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 p-6 text-white">
                <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/15 blur-2xl" />
                <Handshake className="pointer-events-none absolute -bottom-6 -right-4 h-28 w-28 -rotate-12 text-white/5" strokeWidth={1} />
                <p className="relative text-lg font-bold">Want to sell our courses?</p>
                <p className="relative mt-1 text-sm text-brand-100">Recommend courses and earn on every enrolment.</p>
                <Link
                  href="/partner-apply"
                  className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-bold text-brand-900 transition hover:bg-gold-300 active:scale-95"
                >
                  Become a partner <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Message form */}
          <Reveal variant="right">
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </main>
  );
}