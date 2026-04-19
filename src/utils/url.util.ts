export function toUrlOrNull(value: string | null): URL | null {
  if (!value) return null;

  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`);
  } catch {
    return null;
  }
}
