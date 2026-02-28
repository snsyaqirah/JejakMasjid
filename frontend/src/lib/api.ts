/**
 * JejakMasjid API client
 * ─────────────────────────────────────────────────────────────────────────────
 * All fetch calls go through here. camelCase on FE matches the Pydantic
 * alias_generator on the backend, so no mapping layer is needed.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ── Token helpers ─────────────────────────────────────────────────────────────

function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(res.status, error.error ?? error.detail ?? "Request failed");
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: { email: string; password: string; fullName: string }) =>
    request("/api/v1/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: async (body: { email: string; password: string }) => {
    const tokens = await request<{ accessToken: string; refreshToken: string }>(
      "/api/v1/auth/login",
      { method: "POST", body: JSON.stringify(body) }
    );
    setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens;
  },

  logout: () => {
    const refresh = localStorage.getItem("refresh_token");
    clearTokens();
    return request("/api/v1/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: refresh }),
    });
  },

  googleLogin: () => {
    window.location.href = `${BASE_URL}/api/v1/auth/google`;
  },
};

// ── Masjids ───────────────────────────────────────────────────────────────────

export const masjidsApi = {
  list: (params?: {
    page?: number;
    pageSize?: number;
    city?: string;
    state?: string;
    status?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    );
    return request(`/api/v1/masjids?${qs}`);
  },

  get: (slug: string) => request(`/api/v1/masjids/${slug}`),

  nearby: (lat: number, lng: number, radiusMeters = 100) =>
    request(`/api/v1/masjids/nearby?latitude=${lat}&longitude=${lng}&radiusMeters=${radiusMeters}`),

  create: (body: unknown) =>
    request("/api/v1/masjids", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: unknown) =>
    request(`/api/v1/masjids/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  verify: (id: string, action: "upvote" | "flag" = "upvote") =>
    request(`/api/v1/masjids/${id}/verify`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  reviews: (id: string, page = 1) =>
    request(`/api/v1/masjids/${id}/reviews?page=${page}`),

  addReview: (id: string, body: unknown) =>
    request(`/api/v1/masjids/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  visits: (id: string, page = 1) =>
    request(`/api/v1/masjids/${id}/visits?page=${page}`),
};

// ── Visits / Langkah ──────────────────────────────────────────────────────────

export const visitsApi = {
  checkIn: (body: unknown) =>
    request("/api/v1/visits", { method: "POST", body: JSON.stringify(body) }),

  myVisits: (page = 1, prayerType?: string) => {
    const qs = prayerType ? `&prayerType=${prayerType}` : "";
    return request(`/api/v1/visits/me?page=${page}${qs}`);
  },

  delete: (id: string) =>
    request(`/api/v1/visits/${id}`, { method: "DELETE" }),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersApi = {
  me: () => request("/api/v1/users/me"),
  updateMe: (body: unknown) =>
    request("/api/v1/users/me", { method: "PATCH", body: JSON.stringify(body) }),
  profile: (id: string) => request(`/api/v1/users/${id}`),
};
