export function getStoredString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getStoredBoolean(key: string, fallback = false): boolean {
  const value = getStoredString(key);
  if (value === null) return fallback;
  return value === 'true';
}

export function setStoredValue(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures in restricted environments.
  }
}
