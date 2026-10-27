import { BookOpen, GraduationCap, Lightbulb, Trophy } from "lucide-react";
import Float from "@/components/site/Float";

/* Our courses section ka creative background: blobs, rings, dots, sparkles aur education icons. */
export default function CoursesDecor() {
  const icons = [
    { Icon: GraduationCap, cls: "left-[2%] top-[6%] h-16 w-16 -rotate-12 text-brand-300/20" },
    { Icon: Lightbulb, cls: "right-[3%] top-[9%] h-14 w-14 rotate-12 text-gold-500/20" },
    { Icon: BookOpen, cls: "left-[3%] bottom-[10%] hidden h-14 w-14 rotate-6 text-gold-500/20 lg:block" },
    { Icon: Trophy, cls: "right-[2%] bottom-[12%] hidden h-16 w-16 -rotate-6 text-brand-300/20 lg:block" },
  ];

  const sparkles = [
    "left-[14%] top-[12%] h-4 w-4",
    "right-[16%] top-[22%] h-5 w-5",
    "left-[9%] top-[46%] h-3 w-3",
    "right-[10%] top-[52%] h-4 w-4",
    "left-[18%] bottom-[14%] h-5 w-5",
    "right-[20%] bottom-[18%] h-3 w-3",
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft blobs */}
      <svg className="absolute -left-28 top-10 h-[26rem] w-[26rem] text-brand-100/70" viewBox="0 0 200 200" fill="currentColor">
        <path d="M44.7,-58.4C57.6,-48.6,67.2,-33.8,71.3,-17.4C75.4,-1,74,17.1,65.6,30.7C57.2,44.3,41.8,53.4,25.3,60.4C8.8,67.4,-8.7,72.3,-24.6,68C-40.5,63.7,-54.8,50.2,-63.9,34.2C-73,18.2,-76.9,-0.3,-72.1,-16C-67.3,-31.7,-53.8,-44.6,-39.3,-54C-24.8,-63.4,-9.3,-69.3,3.9,-74.2C17.1,-79.1,31.8,-68.2,44.7,-58.4Z" transform="translate(100 100)" />
      </svg>
      <svg className="absolute -right-32 bottom-10 h-[30rem] w-[30rem] text-gold-400/10" viewBox="0 0 200 200" fill="currentColor">
        <path d="M39.9,-52.6C51.6,-43.6,60.9,-31.4,64.8,-17.6C68.7,-3.8,67.2,11.6,60.4,23.8C53.6,36,41.5,45,28.5,52.1C15.5,59.2,1.6,64.4,-12.9,63.2C-27.4,62,-42.5,54.4,-52.4,42.4C-62.3,30.4,-67,14,-65.4,-1.1C-63.8,-16.2,-55.9,-30,-45,-39.2C-34.1,-48.4,-20.2,-53,-5.5,-47.6C9.2,-42.2,28.2,-61.6,39.9,-52.6Z" transform="translate(100 100)" />
      </svg>

      {/* Dot grids */}
      <svg className="absolute left-0 top-0 h-44 w-52 text-brand-300/50" fill="currentColor">
        <defs>
          <pattern id="courses-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#courses-dots)" />
      </svg>
      <svg className="absolute bottom-0 right-0 hidden h-44 w-52 text-brand-300/50 sm:block" fill="currentColor">
        <rect width="100%" height="100%" fill="url(#courses-dots)" />
      </svg>

      {/* Gold sparkles */}
      {sparkles.map((cls, i) => (
        <div key={i} className={`absolute ${cls}`}>
          <Float className="h-full w-full" delay={i * 0.5} duration={4 + (i % 3)} distance={8}>
            <svg viewBox="0 0 16 16" className="h-full w-full text-gold-400/70" fill="currentColor">
              <path d="M8 0C8 5 11 8 16 8C11 8 8 11 8 16C8 11 5 8 0 8C5 8 8 5 8 0Z" />
            </svg>
          </Float>
        </div>
      ))}

      {/* Floating education icons */}
      {icons.map(({ Icon, cls }, i) => (
        <div key={i} className={`absolute ${cls}`}>
          <Float className="h-full w-full" delay={i * 0.6} duration={6 + (i % 3) * 1.5}>
            <Icon className="h-full w-full" strokeWidth={1.5} />
          </Float>
        </div>
      ))}
    </div>
  );
}