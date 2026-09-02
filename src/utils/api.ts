export async function safeFetchJson<T>(
  url: string,
  options?: RequestInit,
  retries = 2,
  delayMs = 600
): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (attempt < retries && (response.status >= 500 || response.status === 404)) {
          await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
          continue;
        }
        return null;
      }
      const data = await response.json();
      return data as T;
    } catch {
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
        continue;
      }
      return null;
    }
  }
  return null;
}
