import Reveal from "@/components/site/Reveal";

const STATS = [
  { value: "15+", label: "Years of excellence" },
  { value: "1000s", label: "Students helped to secure jobs" },
  { value: "5", label: "Exam streams covered" },
  { value: "2", label: "Ways to learn: online and offline" },
];

export default function StatsBand() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 px-6 py-10 text-white shadow-xl shadow-brand-900/20 md:px-12">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-gold-400/15" />
          <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full text-white/10" fill="currentColor">
            <defs>
              <pattern id="stats-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#stats-dots)" />
          </svg>

          <dl className="relative grid grid-cols-2 gap-y-8 md:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`px-4 text-center ${i > 0 ? "md:border-l md:border-white/15" : ""} ${i % 2 === 1 ? "border-l border-white/15 md:border-l" : ""}`}
              >
                <dd className="text-4xl font-bold text-gold-400 md:text-5xl">{s.value}</dd>
                <dt className="mt-1 text-sm font-medium text-brand-100">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </section>
  );
}