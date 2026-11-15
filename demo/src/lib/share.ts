function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(data: string): string {
  const b64 = data.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Link dạng `#code=...`. */
export function buildShareUrl(code: string): string {
  const url = new URL(location.href);
  url.hash = `code=${toBase64Url(code)}`;
  return url.toString();
}

/** Đọc code đã chia sẻ từ hash, trả về null nếu không có hoặc hỏng. */
export function readSharedCode(): string | null {
  const match = /^#code=([A-Za-z0-9_-]+)$/.exec(location.hash);
  if (!match || !match[1]) return null;
  try {
    return fromBase64Url(match[1]);
  } catch {
    return null;
  }
}

/** Hash dạng `#intro`, `#playground` hoặc `#compare`. */
export function readTabHash(): "intro" | "playground" | "compare" | null {
  const h = location.hash.slice(1);
  return h === "intro" || h === "playground" || h === "compare" ? h : null;
}

/** Hash dạng `#lesson=<id>`. */
export function readLessonId(): string | null {
  const match = /^#lesson=([\w-]+)$/.exec(location.hash);
  return match?.[1] ?? null;
}
