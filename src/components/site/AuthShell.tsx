"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { GraduationCap } from "lucide-react";
import { SITE } from "@/lib/site-config";
import Float from "@/components/site/Float";
import Reveal from "@/components/site/Reveal";

export type AuthPerk = { icon: LucideIcon; title: string; text: string };

function Sparkle({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={className} fill="currentColor">
      <path d="M8 0C8 5 11 8 16 8C11 8 8 11 8 16C8 11 5 8 0 8C5 8 8 5 8 0Z" />
    </svg>
  );
}

/**
 * Login aur Register dono ka common layout:
 * left mein navy brand panel, right mein form (children).
 */
export default function AuthShell({
  badge,
  title,
  text,
  perks,
  wide = false,
  children,
}: {
  badge: string;
  title: ReactNode;
  text: string;
  perks: AuthPerk[];
  /** Lambe form (register) ke liye card thoda chaudha */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen font-[family-name:var(--font-lato)] lg:grid-cols-[1.05fr_1fr]">
      {/* Left: brand panel (desktop par sticky, form scroll hota rahe to bhi dikhta hai) */}
      <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-900 px-6 py-8 text-white sm:px-10 lg:sticky lg:top-0 lg:h-screen lg:px-14 lg:py-12">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-gold-400/15 blur-3xl" />
          <svg className="absolute inset-0 h-full w-full text-white/10" fill="currentColor">
            <defs>
              <pattern id="auth-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-dots)" />
          </svg>
          <svg className="absolute -right-28 -top-24 h-[26rem] w-[26rem] text-white/15" viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="200" cy="200" r="70" />
            <circle cx="200" cy="200" r="125" />
            <circle cx="200" cy="200" r="180" strokeDasharray="4 9" />
            <circle cx="325" cy="200" r="7" fill="#fbbf24" stroke="none" />
          </svg>
          <GraduationCap className="absolute -bottom-10 -right-8 hidden h-64 w-64 -rotate-12 text-white/5 lg:block" strokeWidth={1} />
          <div className="absolute left-[12%] top-[44%] hidden h-5 w-5 lg:block">
            <Float className="h-full w-full" distance={8} duration={5}>
              <Sparkle className="h-full w-full text-gold-300/70" />
            </Float>
          </div>
          <div className="absolute right-[18%] top-[62%] hidden h-4 w-4 lg:block">
            <Float className="h-full w-full" distance={8} duration={6} delay={1}>
              <Sparkle className="h-full w-full text-gold-300/70" />
            </Float>
          </div>
        </div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="rounded-xl bg-white p-1.5 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="" className="h-10 w-auto" />
          </span>
          <span className="text-lg font-black leading-tight">{SITE.brand}</span>
        </div>

        {/* Message */}
        <div className="relative z-10 my-10 lg:my-0">
          <Reveal variant="left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-gold-300 backdrop-blur">
              <GraduationCap className="h-4 w-4" /> {badge}
            </span>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="mt-4 hidden max-w-md text-brand-100 sm:block">{text}</p>
          </Reveal>

          <ul className="mt-8 hidden space-y-4 lg:block">
            {perks.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} variant="left" delay={150 + i * 120}>
                  <li className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-400 text-brand-900">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold">{p.title}</p>
                      <p className="text-sm text-brand-100">{p.text}</p>
                    </div>
                  </li>
                </Reveal>
              );
            })}
          </ul>
        </div>

        <p className="relative z-10 hidden text-sm text-brand-100/80 lg:block">{SITE.tagline}</p>
      </section>

      {/* Right: form area */}
      <section className="relative flex items-center justify-center overflow-hidden bg-[#EEF3FB] px-4 py-12 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <svg className="absolute -bottom-24 -right-24 h-80 w-80 text-brand-100" viewBox="0 0 200 200" fill="currentColor">
            <path d="M39.9,-52.6C51.6,-43.6,60.9,-31.4,64.8,-17.6C68.7,-3.8,67.2,11.6,60.4,23.8C53.6,36,41.5,45,28.5,52.1C15.5,59.2,1.6,64.4,-12.9,63.2C-27.4,62,-42.5,54.4,-52.4,42.4C-62.3,30.4,-67,14,-65.4,-1.1C-63.8,-16.2,-55.9,-30,-45,-39.2C-34.1,-48.4,-20.2,-53,-5.5,-47.6C9.2,-42.2,28.2,-61.6,39.9,-52.6Z" transform="translate(100 100)" />
          </svg>
          <svg className="absolute left-0 top-0 h-40 w-48 text-brand-300/50" fill="currentColor">
            <defs>
              <pattern id="auth-dots-light" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-dots-light)" />
          </svg>
        </div>

        <Reveal variant="up" className={`relative z-10 w-full ${wide ? "max-w-lg" : "max-w-md"}`}>
          {children}
        </Reveal>
      </section>
    </main>
  );
}