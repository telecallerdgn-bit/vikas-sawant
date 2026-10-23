import Link from "next/link";
import { ImageOff } from "lucide-react";
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
      className="group flex flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="aspect-[16/10] overflow-hidden bg-brand-50">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-300">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {post.publishedAt && (
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
            {dateLong.format(post.publishedAt)}
          </p>
        )}
        <h3 className="mt-2 text-lg font-bold leading-snug text-brand-900 group-hover:text-brand-600">{post.title}</h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{post.excerpt}</p>}
      </div>
    </Link>
  );
}