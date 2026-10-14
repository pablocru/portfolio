import { base } from "astro:config/client";

export function toUrlOrNull(raw: string): URL | null {
  const value = raw.trim();

  if (value === "") {
    return null;
  }

  const normalized = /^https?:\/\//.test(value) ? value : `https://${value}`;

  try {
    return new URL(normalized);
  } catch {
    return null;
  }
}

export function withBase(href: string): string {
  if (!href.startsWith("/")) {
    return href;
  }

  const normalizedBase = base.endsWith("/") ? base : `${base}/`;

  return `${normalizedBase}${href.slice(1)}`;
}
