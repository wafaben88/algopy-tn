// Tiny typed fetch wrapper for the AlgoPy TN backend.
//
// The backend runs separately (Flask). In dev: http://127.0.0.1:5050.
// In prod: NEXT_PUBLIC_API_BASE (set at build time on devinapps).

export const API_BASE: string =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) ||
  "http://127.0.0.1:5050";

const TOKEN_KEY = "algopy.access_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type RequestOpts = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  json?: unknown;
  formData?: FormData;
  // If false, do not attach Authorization header even if a token is stored.
  withAuth?: boolean;
};

export async function apiFetch<T = unknown>(
  path: string,
  opts: RequestOpts = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.json !== undefined) headers["Content-Type"] = "application/json";

  const withAuth = opts.withAuth !== false;
  if (withAuth) {
    const token = getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body:
      opts.formData ??
      (opts.json !== undefined ? JSON.stringify(opts.json) : undefined),
  });

  if (res.status === 204) return undefined as unknown as T;

  const text = await res.text();
  let parsed: unknown = undefined;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    const msg =
      (typeof parsed === "object" && parsed !== null && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : null) ?? res.statusText;
    throw new ApiError(res.status, msg, parsed);
  }

  return parsed as T;
}

// Convenience: build an absolute URL for the secure-image route.
// The frontend ALWAYS fetches this via fetch+Authorization header — never
// embeds it in an <img src> attribute.
export function secureImageUrl(token: string): string {
  return `${API_BASE}/api/secure-image/${token}`;
}
