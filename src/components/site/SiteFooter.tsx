import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Lightbulb, Mail, MapPin, Pencil, Phone, Sparkles } from "lucide-react";
import { SITE } from "@/lib/site-config";
import BackToTop from "@/components/site/BackToTop";

const link = "text-sm text-slate-600 transition hover:text-brand-700";
const head = "text-lg font-bold text-brand-900";

type SocialKey = keyof typeof SITE.social;

// Brand icons are drawn here because newer lucide-react versions no longer include them.
function SocialIcon({ name }: { name: SocialKey }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-4 w-4",
    "aria-hidden": true,
  };

  switch (name) {
    case "facebook":
      return (
        <svg {...common}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <path d="m10 15 5-3-5-3z" />
        </svg>
      );
  }
}

const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;

// Small dots drawn with CSS, used as a pattern on both backgrounds.
const DOTS_LIGHT = {
  backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1.5px, transparent 1.5px)",
  backgroundSize: "22px 22px",
};
const DOTS_DARK = {
  backgroundImage: "radial-gradient(rgba(15,37,87,0.10) 1.5px, transparent 1.5px)",
  backgroundSize: "26px 26px",
};
const STRIPES = {
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(15,37,87,0.035) 0, rgba(15,37,87,0.035) 2px, transparent 2px, transparent 22px)",
};

export default function SiteFooter() {
  const socials = (Object.keys(SITE.social) as SocialKey[])
    .map((key) => ({ key, href: SITE.social[key] }))
    .filter((s) => /^https?:\/\//i.test(s.href));

  return (
    <footer>
      {/* ---------- Call to action band ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white">
        {/* dot pattern */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={DOTS_LIGHT} />

        {/* glowing blobs */}
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 right-16 h-96 w-96 rounded-full bg-gold-400/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute left-1/3 top-1/2 h-56 w-56 rounded-full bg-brand-400/20 blur-3xl" />

        {/* big rings */}
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[28px] border-white/5" />
        <div aria-hidden className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full border-[18px] border-gold-400/10" />

        {/* floating learning icons */}
        <GraduationCap aria-hidden className="pointer-events-none absolute left-[6%] top-10 h-14 w-14 -rotate-12 text-gold-400/25" />
        <BookOpen aria-hidden className="pointer-events-none absolute bottom-16 left-[38%] h-12 w-12 rotate-6 text-white/15" />
        <Lightbulb aria-hidden className="pointer-events-none absolute right-[8%] top-8 h-12 w-12 rotate-12 text-gold-300/30" />
        <Pencil aria-hidden className="pointer-events-none absolute bottom-20 right-[30%] h-10 w-10 -rotate-45 text-white/15" />
        <Sparkles aria-hidden className="pointer-events-none absolute left-[28%] top-8 h-8 w-8 text-gold-400/40" />
        <Sparkles aria-hidden className="pointer-events-none absolute bottom-24 right-[6%] h-7 w-7 text-gold-300/40" />

        <div className="relative mx-auto grid max-w-6xl items-end gap-8 px-4 pb-24 pt-14 md:grid-cols-[1.3fr_1fr] md:pb-28 md:pt-16">
          <div className="self-center">
            <h2 className="text-3xl font-black leading-tight md:text-5xl">
              Ready to get{" "}
              <span className="underline decoration-gold-400 decoration-4 underline-offset-8">started?</span>
              <br />
              Let&apos;s talk to us today
            </h2>
            <Link
              href="/courses"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-bold text-brand-900 shadow-lg shadow-black/20 transition hover:bg-gold-300"
            >
              Start learning now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* The photo sits on the bottom edge of the band; the wave below covers its lower end. */}
          <div className="relative -mb-24 hidden justify-center self-end md:-mb-28 md:flex">
            <span className="absolute bottom-16 h-64 w-64 rounded-full bg-gold-400/20" />
            <span className="absolute bottom-8 h-80 w-80 rounded-full border-2 border-dashed border-white/15" />
            <span className="absolute right-0 top-2 h-24 w-24 rounded-full border-4 border-dotted border-gold-400/60" />
            <Image
              src="/about/ftrs.png"
              alt={SITE.brand}
              width={360}
              height={370}
              loading="eager"
              className="relative h-72 w-auto drop-shadow-2xl lg:h-[22rem]"
            />
          </div>
        </div>

        {/* wave that flows into the main footer */}
        <svg
          aria-hidden
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 block h-14 w-full text-gold-50 md:h-20"
        >
          <path
            d="M0,50 C180,100 360,0 560,35 C760,70 900,100 1100,55 C1250,20 1350,30 1440,50 L1440,90 L0,90 Z"
            fill="currentColor"
          />
        </svg>
      </section>

      {/* ---------- Main footer ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gold-50 via-white to-brand-50 text-slate-700">
        {/* dot and stripe patterns */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={DOTS_DARK} />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={STRIPES} />

        {/* soft shapes */}
        <div aria-hidden className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-gold-200/50 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-10 top-8 h-40 w-40 rounded-full border-[14px] border-gold-300/30" />
        <div aria-hidden className="pointer-events-none absolute bottom-10 left-1/3 h-24 w-24 rounded-full border-[10px] border-brand-200/50" />

        {/* big watermark icons */}
        <GraduationCap aria-hidden className="pointer-events-none absolute -bottom-6 right-6 h-64 w-64 -rotate-12 text-brand-900/[0.04]" />
        <BookOpen aria-hidden className="pointer-events-none absolute -left-6 bottom-4 h-48 w-48 rotate-12 text-gold-500/[0.08]" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-brand-100">
          <div className="lg:pr-10">
            <Image src="/logo.webp" alt={SITE.brand} width={360} height={370} className="h-16 w-auto" />
            <p className="mt-4 text-sm leading-relaxed text-slate-600">{SITE.aboutText}</p>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="lg:px-10">
            <p className={head}>Useful Links</p>
            <span className="mt-2 block h-1 w-10 rounded-full bg-gold-400" />
            <ul className="mt-5 space-y-3">
              <li><Link href="/" className={link}>Home</Link></li>
              <li><Link href="/courses" className={link}>Courses</Link></li>
              <li><Link href="/blog" className={link}>Blog</Link></li>
              <li><Link href="/contact" className={link}>Contact us</Link></li>
            </ul>
          </div>

          <div className="lg:px-10">
            <p className={head}>Our Company</p>
            <span className="mt-2 block h-1 w-10 rounded-full bg-gold-400" />
            <ul className="mt-5 space-y-3">
              <li><Link href="/partner-apply" className={link}>Become a partner</Link></li>
              <li><Link href="/student/login" className={link}>Student login</Link></li>
              <li><Link href="/student/register" className={link}>Create account</Link></li>
              <li><Link href="/portal" className={link}>Partner and staff login</Link></li>
            </ul>
          </div>

          <div className="lg:pl-10">
            <p className={head}>Get Contact</p>
            <span className="mt-2 block h-1 w-10 rounded-full bg-gold-400" />
            <ul className="mt-5 space-y-3 text-sm">
              {SITE.phones.map((p) => (
                <li key={p.number} className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                  <a href={telHref(p.number)} className="hover:text-brand-700">
                    <span className="font-semibold text-brand-900">{p.label}:</span> {p.number}
                  </a>
                </li>
              ))}
              {SITE.email && (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                  <a href={`mailto:${SITE.email}`} className="break-all hover:text-brand-700">
                    {SITE.email}
                  </a>
                </li>
              )}
              {SITE.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                  <span>{SITE.address}</span>
                </li>
              )}
            </ul>

            {socials.length > 0 && (
              <div className="mt-5 flex items-center gap-2.5">
                {socials.map(({ key, href }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-gold-400"
                  >
                    <SocialIcon name={key} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Bottom bar ---------- */}
      <section className="bg-brand-900 text-xs text-white">
        <div className="flex flex-col md:flex-row">
          <p className="bg-gold-400 px-4 py-3.5 text-center font-semibold text-brand-900 md:w-1/2 md:pr-12 md:text-right md:[clip-path:polygon(0_0,100%_0,calc(100%-28px)_100%,0_100%)]">
            &copy; {SITE.brand}. All rights reserved.
          </p>
          <nav aria-label="Footer" className="flex flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-3.5 md:justify-start md:pl-8">
            <Link href="/student/login" className="hover:text-gold-300">Student login</Link>
            <span className="text-white/40">-</span>
            <Link href="/student/register" className="hover:text-gold-300">Register</Link>
            <span className="text-white/40">-</span>
            <Link href="/partner-apply" className="hover:text-gold-300">Become a partner</Link>
          </nav>
        </div>
      </section>

      <BackToTop />
    </footer>
  );
}