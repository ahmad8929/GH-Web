/**
 * Single HTTP layer for every network call in the app.
 *
 * - Works in Server Components (no token, cacheable) and in the browser
 *   (bearer token injected, transparent refresh-on-401 with a single-flight
 *   refresh so parallel requests never race the rotating refresh token).
 * - Throws ApiError with the backend's message for every failure.
 */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const isBrowser = typeof window !== "undefined";

const KEYS = {
  access: "gh.access",
  refresh: "gh.refresh",
  user: "gh.user",
} as const;

export const tokenStore = {
  get access(): string | null {
    return isBrowser ? window.localStorage.getItem(KEYS.access) : null;
  },
  get refresh(): string | null {
    return isBrowser ? window.localStorage.getItem(KEYS.refresh) : null;
  },
  set(pair: { access: string; refresh: string }) {
    if (!isBrowser) return;
    window.localStorage.setItem(KEYS.access, pair.access);
    window.localStorage.setItem(KEYS.refresh, pair.refresh);
  },
  clear() {
    if (!isBrowser) return;
    window.localStorage.removeItem(KEYS.access);
    window.localStorage.removeItem(KEYS.refresh);
    window.localStorage.removeItem(KEYS.user);
  },
};

/** Rotating refresh tokens: only one refresh may be in flight at a time. */
let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refresh = tokenStore.refresh;
      if (!refresh) return false;
      try {
        const res = await fetch(`${API_URL}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refresh }),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok || !body?.accessToken) return false;
        tokenStore.set({ access: body.accessToken, refresh: body.refreshToken });
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export type ApiQuery = Record<
  string,
  string | number | boolean | undefined | null
>;

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  form?: FormData;
  query?: ApiQuery;
  /** Attach the bearer token when available (browser only). Default true. */
  auth?: boolean;
  /** Passed through to fetch for Server Component caching. */
  next?: { revalidate?: number | false; tags?: string[] };
  cache?: RequestCache;
  signal?: AbortSignal;
};

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  return request<T>(path, opts, false);
}

async function request<T>(
  path: string,
  opts: ApiOptions,
  isRetry: boolean,
): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(opts.query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;
  if (opts.form) {
    body = opts.form;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  if (isBrowser && opts.auth !== false) {
    const token = tokenStore.access;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? (body !== undefined ? "POST" : "GET"),
      headers,
      body,
      signal: opts.signal,
      ...(isBrowser ? {} : { cache: opts.cache, next: opts.next }),
    });
  } catch (err) {
    throw new ApiError(0, "Cannot reach the Gyan Hub server", err);
  }

  let payload: { success?: boolean; message?: string } | null = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (
    res.status === 401 &&
    isBrowser &&
    opts.auth !== false &&
    !isRetry &&
    tokenStore.refresh
  ) {
    const refreshed = await refreshTokens();
    if (refreshed) return request<T>(path, opts, true);
    tokenStore.clear();
    window.dispatchEvent(new Event("gh:unauthorized"));
  }

  if (!res.ok || payload?.success === false) {
    throw new ApiError(
      res.status,
      payload?.message || `Request failed (${res.status})`,
      payload,
    );
  }

  return payload as T;
}

/** Server-side convenience: swallow failures so public pages never crash. */
export async function safe<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}
