import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { dateLong } from "@/components/site/ui";

export type PostCardData = {
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
};

export default function BlogCard({ post }: { post: PostCardData }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-gold-400 hover:shadow-2xl"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-900 to-brand-600">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="relative flex h-full items-center justify-center text-white/40">
            <svg aria-hidden className="absolute inset-0 h-full w-full text-white/10" fill="currentColor">
              <defs>
                <pattern id="blog-card-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#blog-card-dots)" />
            </svg>
            <Newspaper className="relative h-14 w-14" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Content panel: image ke upar curve ke saath chadha hua */}
      <div className="relative -mt-6 flex flex-1 flex-col overflow-hidden rounded-t-3xl bg-white px-5 pb-5 pt-5">
        {/* Bada halka icon peeche */}
        <Newspaper className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 text-brand-50 transition duration-500 group-hover:-rotate-12 group-hover:text-gold-400/15" />

        {post.publishedAt && (
          <p className="relative flex items-center gap-2 text-sm text-slate-500">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-100 text-brand-900">
              <CalendarDays className="h-4 w-4" />
            </span>
            {dateLong.format(post.publishedAt)}
          </p>
        )}

        <h3 className="relative mt-4 text-lg font-bold leading-snug text-brand-900 transition group-hover:text-brand-700">
          {post.title}
        </h3>
        <span className="relative mt-2 block h-1 w-10 rounded-full bg-gold-400 transition-all duration-300 group-hover:w-24" />

        <span className="relative mt-auto flex items-center gap-2 pt-5 text-sm font-bold text-brand-900">
          Read more
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-900 transition duration-300 group-hover:bg-gold-400">
            <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5" />
          </span>
        </span>
      </div>
    </Link>
  );
}