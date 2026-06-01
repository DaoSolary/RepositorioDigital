/** Evita open redirect em parâmetros ?next= */
export function safeRedirectPath(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  const path = next.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.includes("\\") || path.includes("@") || path.includes("\0")) return fallback;
  try {
    const decoded = decodeURIComponent(path);
    if (decoded.startsWith("//") || decoded.includes("://")) return fallback;
  } catch {
    return fallback;
  }
  return path;
}
