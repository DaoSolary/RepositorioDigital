/** Navegadores móveis que não exibem PDF de forma fiável dentro de <iframe>. */
export function isMobilePdfHost(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}
