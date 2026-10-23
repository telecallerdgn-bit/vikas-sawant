import ReactMarkdown, { type Components } from "react-markdown";

const components: Components = {
  // The page already has one h1, so a markdown "#" becomes an h2
  h1: ({ children }) => <h2 className="mb-3 mt-10 text-3xl font-black text-[#2b1a5a]">{children}</h2>,
  h2: ({ children }) => <h2 className="mb-3 mt-10 text-2xl font-bold text-[#2b1a5a]">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-8 text-xl font-bold text-[#2b1a5a]">{children}</h3>,
  p: ({ children }) => <p className="my-4 leading-relaxed text-slate-700">{children}</p>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-1.5 pl-6 text-slate-700">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-1.5 pl-6 text-slate-700">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 rounded-r-2xl border-l-4 border-orange-400 bg-orange-50 px-5 py-3 text-slate-700">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-orange-100" />,
  a: ({ href, children }) => {
    const external = /^https?:\/\//.test(href ?? "");
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="font-semibold text-orange-600 underline hover:text-orange-700"
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : undefined}
      alt={alt ?? ""}
      loading="lazy"
      referrerPolicy="no-referrer"
      className="my-6 w-full rounded-2xl border border-orange-100"
    />
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="my-5 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-slate-100">
      {children}
    </pre>
  ),
};

export default function Markdown({ text }: { text: string }) {
  return <ReactMarkdown components={components}>{text}</ReactMarkdown>;
}