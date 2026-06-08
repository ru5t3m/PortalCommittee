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
};

type TokenResponse = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
};

export type TelegramLoginStart = {
  challenge_id: number;
  nonce: string;
  deep_link: string;
  expires_at: string;
};

export type TelegramLoginStatus = {
  challenge_id: number;
  status: "pending" | "awaiting_contact" | "verified" | "consumed" | "expired";
  expires_at: string;
  phone_verified: boolean;
};

const ACCESS_TOKEN_KEY = "knb-access-token";
const ADMIN_ACCESS_TOKEN_KEY = "knb-admin-access-token";
let refreshPromise: Promise<TokenResponse> | null = null;

function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

function setStoredAccessToken(token: string) {
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.dispatchEvent(new CustomEvent("knb-auth-changed"));
}

function clearStoredAccessToken() {
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  window.dispatchEvent(new CustomEvent("knb-auth-changed"));
}

async function storeTokenFromResponse(response: Response) {
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const token = (await response.json()) as TokenResponse;
  setStoredAccessToken(token.access_token);
  return token;
}

export async function startTelegramLogin() {
  const response = await fetch(`${API_URL}/auth/telegram/start`, {
    method: "POST",
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as TelegramLoginStart;
}

export async function getTelegramLoginStatus(challengeId: number) {
  const response = await fetch(`${API_URL}/auth/telegram/status/${challengeId}`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as TelegramLoginStatus;
}

export async function completeTelegramLogin(challengeId: number, nonce: string) {
  const response = await fetch(`${API_URL}/auth/telegram/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ challenge_id: challengeId, nonce })
  });
  return storeTokenFromResponse(response);
}

export async function loginWithPassword(email: string, password: string) {
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
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });
  clearStoredAccessToken();
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
    const refreshed = await refreshSession();
    const retryHeaders = new Headers(init.headers);
    retryHeaders.set("Authorization", `Bearer ${refreshed.access_token}`);
    return authFetch(input, { ...init, headers: retryHeaders }, false);
  }

  return response;
}

export async function adminAuthFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = typeof window === "undefined" ? null : window.sessionStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, {
    ...init,
    headers,
    credentials: "include"
  });
}

export async function getMe() {
  const response = await authFetch(`${API_URL}/auth/me`);
  if (!response.ok) {
    clearStoredAccessToken();
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as AuthMe;
}
