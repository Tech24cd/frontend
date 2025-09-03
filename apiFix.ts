const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function fixUrl(url: string) {
  // si l'url commence par localhost:3000, on remplace
  if (url.startsWith("http://localhost:3000")) {
    return url.replace("http://localhost:3000", BACKEND_URL);
  }
  return url;
}

// wrapper fetch
export async function fetchFix(url: string, options?: RequestInit) {
  return fetch(fixUrl(url), options);
}
