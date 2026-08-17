/**
 * Resolves a given path or asset URL with the configured base URL (e.g. for GitHub Pages).
 * Handles external URLs, mailto/tel protocols, and ensures clean trailing/leading slashes.
 */
export function getUrl(path?: string): string {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:')
  ) {
    return path;
  }

  const rawBase = import.meta.env.BASE_URL || '/';
  const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (cleanPath === '/') {
    return base ? `${base}/` : '/';
  }

  return `${base}${cleanPath}`;
}
