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
