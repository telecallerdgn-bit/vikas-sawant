type Embed = { kind: "iframe"; src: string } | { kind: "video"; src: string };

function youtubeId(u: URL): string | null {
  const host = u.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;
  if (host === "youtu.be") {
    id = u.pathname.slice(1).split("/")[0] || null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    id = u.searchParams.get("v");
    if (!id) {
      const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/);
      id = m ? m[1] : null;
    }
  }
  return id && /^[\w-]{6,15}$/.test(id) ? id : null;
}

function toEmbed(raw: string): Embed | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;

  const yt = youtubeId(u);
  if (yt) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1` };

  const host = u.hostname.replace(/^www\./, "");
  if (host === "vimeo.com") {
    const m = u.pathname.match(/^\/(\d+)(?:\/([a-f0-9]+))?/);
    if (m) {
      const hash = m[2] ?? u.searchParams.get("h");
      return { kind: "iframe", src: `https://player.vimeo.com/video/${m[1]}${hash ? `?h=${hash}` : ""}` };
    }
  }
  if (host === "player.vimeo.com" && /^\/video\/\d+/.test(u.pathname)) {
    return { kind: "iframe", src: u.href };
  }

  if (host.endsWith("mediadelivery.net")) return { kind: "iframe", src: u.href };

  if (/\.(mp4|webm)$/i.test(u.pathname)) return { kind: "video", src: u.href };

  return null;
}

export default function LessonPlayer({ url, title }: { url: string; title: string }) {
  const embed = toEmbed(url);

  if (!embed) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        This video could not be loaded. Please contact support.
      </p>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black">
      {embed.kind === "iframe" ? (
        <iframe
          src={embed.src}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <video src={embed.src} controls controlsList="nodownload" playsInline className="h-full w-full" />
      )}
    </div>
  );
}