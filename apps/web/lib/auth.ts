import { API_URL, parseApiError } from "@/lib/api";

export type AuthUser = {
  id: number;
  email: string | null;
  full_name: string;
  role: "admin" | "moderator" | "candidate";
  telegram_username: string | null;
  phone: string | null;
  phone_verified: boolean;
};

export type CandidateApplication = {
  tracking_code: string;
  status: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  phone: string;
  region: string | null;
  education_level: string | null;
  desired_direction: string | null;
};

export type AuthMe = {
  user: AuthUser;
  candidate_application: CandidateApplication | null;
  can_access_admin: boolean;
};

type TokenResponse = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
};

const ACCESS_TOKEN_KEY = "knb-access-token";
const ADMIN_ACCESS_TOKEN_KEY = "knb-admin-access-token";
const DEMO_SESSION_KEY = "knb-temporary-demo-session";
const DEMO_EMAIL_KEY = "knb-temporary-demo-email";

export const TEMPORARY_DEMO_AUTH_ENABLED = false;

let refreshPromise: Promise<TokenResponse> | null = null;

export function isTemporaryDemoSession() {
  return TEMPORARY_DEMO_AUTH_ENABLED && typeof window !== "undefined" && window.sessionStorage.getItem(DEMO_SESSION_KEY) === "active";
}

function startTemporaryDemoSession(email: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(DEMO_SESSION_KEY, "active");
  window.sessionStorage.setItem(DEMO_EMAIL_KEY, email || "candidate@example.kz");
  window.dispatchEvent(new CustomEvent("knb-auth-changed"));
}

function clearTemporaryDemoSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DEMO_SESSION_KEY);
  window.sessionStorage.removeItem(DEMO_EMAIL_KEY);
  window.dispatchEvent(new CustomEvent("knb-auth-changed"));
}

function getTemporaryDemoUser(): AuthMe {
  const email = typeof window === "undefined" ? "candidate@example.kz" : window.sessionStorage.getItem(DEMO_EMAIL_KEY) || "candidate@example.kz";
  return {
    can_access_admin: false,
    user: {
      id: -1,
      email,
      full_name: "Александр Нурланов",
      role: "candidate",
      telegram_username: null,
      phone: "+7 700 123 45 67",
      phone_verified: true
    },
    candidate_application: {
      tracking_code: "DEMO-2026-001",
      status: "На рассмотрении",
      first_name: "Александр",
      last_name: "Нурланов",
      middle_name: "Ерланович",
      phone: "+7 700 123 45 67",
      region: "г. Астана",
      education_level: "Высшее образование",
      desired_direction: "Информационная безопасность"
    }
  };
}

function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

function setStoredAccessToken(token: string) {
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.dispatchEvent(new CustomEvent("knb-auth-changed"));
}

function clearStoredAccessToken() {
  const hadStoredSession = window.sessionStorage.getItem(ACCESS_TOKEN_KEY) !== null || window.sessionStorage.getItem(ADMIN_ACCESS_TOKEN_KEY) !== null;
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  if (hadStoredSession) {
    window.dispatchEvent(new CustomEvent("knb-auth-changed"));
  }
}

async function storeTokenFromResponse(response: Response) {
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const token = (await response.json()) as TokenResponse;
  setStoredAccessToken(token.access_token);
  return token;
}

export async function loginWithPassword(email: string, password: string) {
  if (TEMPORARY_DEMO_AUTH_ENABLED) {
    startTemporaryDemoSession(email);
    return { access_token: "temporary-demo-session", token_type: "bearer", expires_in: 24 * 60 * 60 } satisfies TokenResponse;
  }

  const response = await fetch(`${API_URL}/auth/password/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password })
  });
  return storeTokenFromResponse(response);
}

export async function registerWithPassword(payload: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  phone: string;
}) {
  const response = await fetch(`${API_URL}/auth/password/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });
  return storeTokenFromResponse(response);
}

export async function loginAdminPanel(email: string, password: string) {
  const response = await authFetch(`${API_URL}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const token = (await response.json()) as TokenResponse;
  window.sessionStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token.access_token);
  return token;
}

export function clearAdminPanelSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function hasAdminPanelSession() {
  if (typeof window === "undefined") return false;
  return Boolean(window.sessionStorage.getItem(ADMIN_ACCESS_TOKEN_KEY));
}

export async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include"
    })
      .then(storeTokenFromResponse)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function logout() {
  if (isTemporaryDemoSession()) {
    clearTemporaryDemoSession();
    clearStoredAccessToken();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: getStoredAccessToken() ? { Authorization: `Bearer ${getStoredAccessToken()}` } : {},
      credentials: "include"
    });
    if (!response.ok) throw new Error(await parseApiError(response));
  } finally {
    clearStoredAccessToken();
    clearTemporaryDemoSession();
  }
}

export async function authFetch(input: string, init: RequestInit = {}, retry = true): Promise<Response> {
  let token = getStoredAccessToken();
  if (!token && retry) {
    try {
      token = (await refreshSession()).access_token;
    } catch {
      clearStoredAccessToken();
    }
  }

  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include"
  });

  if (response.status === 401 && retry) {
    try {
      const refreshed = await refreshSession();
      const retryHeaders = new Headers(init.headers);
      retryHeaders.set("Authorization", `Bearer ${refreshed.access_token}`);
      return authFetch(input, { ...init, headers: retryHeaders }, false);
    } catch {
      clearStoredAccessToken();
      return response;
    }
  }

  return response;
}

export async function adminAuthFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = typeof window === "undefined" ? null : window.sessionStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include"
  });
  if (response.status === 401) {
    clearAdminPanelSession();
    window.dispatchEvent(new CustomEvent("knb-admin-auth-changed"));
  }
  return response;
}

export async function getMe() {
  if (isTemporaryDemoSession()) {
    return getTemporaryDemoUser();
  }
  if (TEMPORARY_DEMO_AUTH_ENABLED) {
    throw new Error("Temporary demo session is not active");
  }

  const response = await authFetch(`${API_URL}/auth/me`);
  if (!response.ok) {
    clearStoredAccessToken();
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as AuthMe;
}
