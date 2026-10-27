import { BookOpen, Radio, PlayCircle, Video } from "lucide-react";
import Float from "@/components/site/Float";

/* Modes section ka halka decorative background. Sirf sajawat, content ke peeche rehta hai. */
export default function ModesDecor() {
  const icons = [
    { Icon: Video, cls: "left-[5%] top-12 h-12 w-12 -rotate-12 text-brand-300/25" },
    { Icon: Radio, cls: "right-[6%] top-16 h-12 w-12 rotate-6 text-brand-300/25" },
    { Icon: BookOpen, cls: "left-[8%] bottom-14 h-12 w-12 rotate-6 text-brand-300/25" },
    { Icon: PlayCircle, cls: "right-[10%] bottom-16 h-12 w-12 -rotate-6 text-brand-300/25" },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute -left-28 -top-28 h-[26rem] w-[26rem] text-brand-100/60" viewBox="0 0 200 200" fill="currentColor">
        <path d="M44.7,-58.4C57.6,-48.6,67.2,-33.8,71.3,-17.4C75.4,-1,74,17.1,65.6,30.7C57.2,44.3,41.8,53.4,25.3,60.4C8.8,67.4,-8.7,72.3,-24.6,68C-40.5,63.7,-54.8,50.2,-63.9,34.2C-73,18.2,-76.9,-0.3,-72.1,-16C-67.3,-31.7,-53.8,-44.6,-39.3,-54C-24.8,-63.4,-9.3,-69.3,3.9,-74.2C17.1,-79.1,31.8,-68.2,44.7,-58.4Z" transform="translate(100 100)" />
      </svg>
      <svg className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] text-gold-400/5" viewBox="0 0 200 200" fill="currentColor">
        <path d="M39.9,-52.6C51.6,-43.6,60.9,-31.4,64.8,-17.6C68.7,-3.8,67.2,11.6,60.4,23.8C53.6,36,41.5,45,28.5,52.1C15.5,59.2,1.6,64.4,-12.9,63.2C-27.4,62,-42.5,54.4,-52.4,42.4C-62.3,30.4,-67,14,-65.4,-1.1C-63.8,-16.2,-55.9,-30,-45,-39.2C-34.1,-48.4,-20.2,-53,-5.5,-47.6C9.2,-42.2,28.2,-61.6,39.9,-52.6Z" transform="translate(100 100)" />
      </svg>

      <svg
        className="absolute inset-x-0 bottom-0 h-28 w-full text-brand-200/40"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M0 70 C 150 20, 300 120, 450 70 S 750 20, 900 70 S 1100 110, 1200 60" />
      </svg>

     {icons.map(({ Icon, cls }, i) => (
        <div key={i} className={`absolute ${cls}`}>
          <Float className="h-full w-full" delay={i * 0.5} duration={7 + (i % 3)}>
            <Icon className="h-full w-full" strokeWidth={1.5} />
          </Float>
        </div>
      ))}
    </div>
  );
}