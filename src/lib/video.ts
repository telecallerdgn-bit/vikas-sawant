export type VideoProvider = "youtube" | "vimeo" | "bunny" | "direct";
export type VideoInfo = { provider: VideoProvider; embedUrl: string };

export const PROVIDER_LABEL: Record<VideoProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  bunny: "Bunny Stream",
  direct: "Direct video file",
};

const YT_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"]);

/** Accepts only https links from known video services. Returns the safe embed address, or null. */
export function parseVideo(raw: string): VideoInfo | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;

  const host = u.hostname.toLowerCase();
  const parts = u.pathname.split("/").filter(Boolean);

  // YouTube
  if (host === "youtu.be" || YT_HOSTS.has(host)) {
    let id: string | null = null;
    if (host === "youtu.be") id = parts[0] ?? null;
    else if (parts[0] === "watch") id = u.searchParams.get("v");
    else if (["embed", "shorts", "live"].includes(parts[0] ?? "")) id = parts[1] ?? null;
    return id && /^[\w-]{11}$/.test(id)
      ? { provider: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${id}` }
      : null;
  }

  // Vimeo
  if (host === "vimeo.com" || host === "www.vimeo.com" || host === "player.vimeo.com") {
    const start = host === "player.vimeo.com" ? parts.indexOf("video") + 1 : 0;
    const id = parts[start];
    const hash = parts[start + 1] ?? u.searchParams.get("h") ?? "";
    if (!id || !/^\d{6,12}$/.test(id)) return null;
    const h = /^[a-f0-9]{6,20}$/i.test(hash) ? `?h=${hash}` : "";
    return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}${h}` };
  }

  // Bunny Stream
  if (host === "iframe.mediadelivery.net") {
    const [kind, library, video] = parts;
    if (
      (kind === "embed" || kind === "play") &&
      /^\d{1,10}$/.test(library ?? "") &&
      /^[a-f0-9-]{36}$/i.test(video ?? "")
    ) {
      return { provider: "bunny", embedUrl: `https://iframe.mediadelivery.net/embed/${library}/${video}` };
    }
    return null;
  }

  // A direct MP4 or WebM file
  if (/\.(mp4|webm)$/i.test(u.pathname)) {
    return { provider: "direct", embedUrl: u.toString() };
  }

  return null;
}