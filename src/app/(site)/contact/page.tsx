import Link from "next/link";
import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { SectionHead } from "@/components/site/ui";
import ContactForm from "@/components/site/ContactForm";

export const metadata = { title: "Contact | vikas-sawant" };

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
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHead
        eyebrow="We are here"
        title="Contact us"
        text="Questions about a course, an order or becoming a partner? Reach out."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* Contact details */}
        <div className="space-y-4">
          {cards.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-brand-200 bg-white p-8 text-center text-slate-500">
              Contact details will be available soon. You can still send us a message using the form.
            </p>
          ) : (
            cards.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="flex items-center gap-4 rounded-3xl border border-brand-100 bg-white p-5 shadow-sm"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <Icon className="h-7 w-7" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-brand-900">{c.title}</h3>
                    <p className="break-all text-sm text-slate-600">{c.value}</p>
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="mt-2 inline-block rounded-full bg-gold-400 px-4 py-1.5 text-sm font-bold text-brand-900 hover:bg-gold-300"
                    >
                      {c.action}
                    </a>
                  </div>
                </div>
              );
            })
          )}

          {hours && (
            <p className="flex items-center gap-2 px-1 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-gold-600" />
              <span>
                <b>Support hours:</b> {hours}
              </span>
            </p>
          )}

          <p className="px-1 text-sm text-slate-500">
            Want to sell our courses?{" "}
            <Link href="/partner-apply" className="font-semibold text-brand-700 hover:underline">
              Become a partner
            </Link>
          </p>
        </div>

        {/* Message form */}
        <ContactForm />
      </div>
    </div>
  );
}