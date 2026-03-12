/**
 * JejakMasjid API client
 * All requests go through here. Matches FastAPI backend at /api/v1/...
 * Note: auth/pagination wrappers are camelCase (Pydantic aliases).
 *       Masjid/facilities data inside `items` is snake_case (raw Supabase).
 */

import type {
  Masjid,
  UserStats,
  UserBadge,
  VisitHistory,
  CheckInResult,
  VerificationStatus,
  LiveStatus,
  PaginatedResponse,
  AuthUser,
} from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ── Token helpers ─────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ── Core fetch wrapper ────────────────────────────────────────────

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
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(res.status, error.detail ?? error.error ?? "Request failed");
  }

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

// ── Auth ──────────────────────────────────────────────────────────

export const authApi = {
  signup: (body: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
  }) =>
    request<{
      message: string;
      email: string;
      userId: string;
      accessToken?: string;
      refreshToken?: string;
      user?: Record<string, unknown>;
    }>(
      "/api/v1/auth/signup",
      { method: "POST", body: JSON.stringify(body) }
    ),

  verifyOtp: async (body: { email: string; token: string }) => {
    const data = await request<{
      message: string;
      accessToken: string;
      refreshToken: string;
      user: Record<string, unknown>;
    }>("/api/v1/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(body),
    });
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  resendOtp: (email: string) =>
    request<{ message: string }>("/api/v1/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  login: async (body: { email: string; password: string }) => {
    const data = await request<{
      accessToken: string;
      refreshToken: string;
      user: Record<string, unknown>;
    }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  logout: async () => {
    try {
      await request("/api/v1/auth/logout", { method: "POST" });
    } finally {
      clearTokens();
    }
  },

  me: () =>
    request<{ id: string; email: string; user_metadata: Record<string, unknown> }>(
      "/api/v1/auth/me"
    ),
};

export function userFromMeta(raw: {
  id: string;
  email: string;
  user_metadata: Record<string, unknown>;
}): AuthUser {
  return {
    id: raw.id,
    email: raw.email,
    fullName:
      (raw.user_metadata?.full_name as string) ??
      raw.email.split("@")[0],
  };
}

// ── Masjids ───────────────────────────────────────────────────────

export const masjidsApi = {
  list: (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    );
    return request<PaginatedResponse<Masjid>>(`/api/v1/masjids?${qs}`);
  },

  get: (id: string) => request<Masjid>(`/api/v1/masjids/${id}`),

  checkNearby: (lat: number, lng: number, radiusMeters = 100) =>
    request<Array<{ id: string; name: string; distance_meters: number }>>(
      "/api/v1/masjids/check-nearby",
      {
        method: "POST",
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          radius_meters: radiusMeters,
        }),
      }
    ),

  create: (body: {
    name: string;
    address: string;
    description?: string;
    latitude: number;
    longitude: number;
  }) =>
    request<Masjid>("/api/v1/masjids", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: string, body: Partial<{ name: string; address: string; description: string }>) =>
    request<Masjid>(`/api/v1/masjids/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

// ── Facilities ────────────────────────────────────────────────────

export const facilitiesApi = {
  get: (masjidId: string) =>
    request<Record<string, unknown> | null>(`/api/v1/facilities/${masjidId}`),

  create: (masjidId: string, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/api/v1/facilities/${masjidId}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (masjidId: string, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/api/v1/facilities/${masjidId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

// ── Check-ins ─────────────────────────────────────────────────────

export const checkinsApi = {
  checkIn: (body: {
    masjidId: string;
    visitType: string;
    latitude: number;
    longitude: number;
  }) =>
    request<CheckInResult>("/api/v1/checkins/", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  history: (page = 1) =>
    request<VisitHistory>(`/api/v1/checkins/history?page=${page}`),
};

// ── Verifications ─────────────────────────────────────────────────

export const verificationsApi = {
  vote: (body: {
    masjidId: string;
    voteType: "upvote" | "downvote";
    reason?: string;
  }) =>
    request("/api/v1/verifications/vote", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getStatus: (masjidId: string) =>
    request<VerificationStatus>(`/api/v1/verifications/status/${masjidId}`),

  report: (body: {
    masjidId: string;
    reportType: string;
    description: string;
  }) =>
    request("/api/v1/verifications/report", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ── Live Updates ──────────────────────────────────────────────────

export const liveUpdatesApi = {
  getStatus: (masjidId: string) =>
    request<LiveStatus>(`/api/v1/live-updates/${masjidId}`),

  post: (body: {
    masjidId: string;
    updateType: string;
    value: string;
  }) =>
    request("/api/v1/live-updates/", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ── Dashboard ─────────────────────────────────────────────────────

export const dashboardApi = {
  stats: () => request<UserStats>("/api/v1/dashboard/stats"),
  badges: () => request<UserBadge[]>("/api/v1/dashboard/badges"),
  leaderboard: (limit = 10) =>
    request<{
      entries: Array<{
        rank: number;
        userId: string;
        fullName: string;
        reputationPoints: number;
        streakCount: number;
        totalVisits: number;
        badgesEarned: number;
      }>;
      userRank: number | null;
      totalUsers: number;
    }>(`/api/v1/dashboard/leaderboard?limit=${limit}`),
};

// ── Public Stats ──────────────────────────────────────────────────

export const statsApi = {
  public: () =>
    request<{
      total_masjids: number;
      verified_masjids: number;
      total_visits: number;
    }>("/api/v1/masjids/stats"),
};

// ── Profile ───────────────────────────────────────────────────────

export const profileApi = {
  get: () =>
    request<{
      id: string;
      full_name: string;
      phone_number: string | null;
      reputation_points: number;
      streak_count: number;
      longest_streak: number;
      last_checkin_at: string | null;
      created_at: string | null;
    }>("/api/v1/profile/me"),

  update: (body: { full_name?: string; phone_number?: string }) =>
    request<{
      id: string;
      full_name: string;
      phone_number: string | null;
      reputation_points: number;
      streak_count: number;
      longest_streak: number;
      last_checkin_at: string | null;
      created_at: string | null;
    }>("/api/v1/profile/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

