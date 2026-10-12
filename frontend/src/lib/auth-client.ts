
export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  authProvider: "local" | "google" | "apple";
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  role?: string;
  createdAt?: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
  error?: string;
}

const TOKEN_KEY = "thirdeye_auth_token";
const USER_KEY = "thirdeye_auth_user";

const DEFAULT_API_URL = "https://third-eye-back.onrender.com";

function getApiUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL as
    | string
    | undefined;

  const baseUrl = (configuredUrl?.trim() || DEFAULT_API_URL)
    .replace(/\/+$/, "");

  // Fail early if the environment variable contains malformed configuration.
  if (!/^https?:\/\/[^/]+$/i.test(baseUrl)) {
    throw new Error(
      "Invalid VITE_API_BASE_URL. Set it to https://third-eye-back.onrender.com",
    );
  }

  return baseUrl;
}

type AuthListener = (user: AuthUser | null) => void;

const listeners = new Set<AuthListener>();

export function subscribeAuth(listener: AuthListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(user: AuthUser | null) {
  listeners.forEach((callback) => {
    try {
      callback(user);
    } catch (error) {
      console.error("[Auth] Listener error:", error);
    }
  });
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser) {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  notifyListeners(user);
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  notifyListeners(null);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // Only allow API paths, not arbitrary URLs.
  if (!endpoint.startsWith("/") || endpoint.startsWith("//")) {
    throw new Error("Invalid API endpoint.");
  }

  const apiUrl = getApiUrl();
  const token = getStoredToken();

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Construct an absolute backend URL. Never silently fall back to Vercel.
  const url = `${apiUrl}${endpoint}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Unable to reach the Third Eye backend. Check your internet connection and backend availability.",
    );
  }

  const responseText = await response.text();

  let data: T;

  try {
    data = JSON.parse(responseText) as T;
  } catch {
    throw new Error(
      `Backend returned an invalid response (HTTP ${response.status}).`,
    );
  }

  if (!response.ok) {
    const errorData = data as {
      message?: string;
      error?: string;
    };

    throw new Error(
      errorData.message ||
        errorData.error ||
        `Request failed with HTTP ${response.status}.`,
    );
  }

  return data;
}

export async function registerUser(body: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<AuthResponse> {
  const result = await request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (result.success && result.token && result.user) {
    setSession(result.token, result.user);
  }

  return result;
}

export async function loginUser(body: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const result = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (result.success && result.token && result.user) {
    setSession(result.token, result.user);
  }

  return result;
}

export async function continueWithGoogle(data?: {
  googleId?: string;
  email?: string;
  name?: string;
  avatar?: string;
  phone?: string;
}): Promise<AuthResponse> {
  const payload = {
    googleId: data?.googleId || `g_${Date.now()}`,
    email: data?.email || "developer.thirdeye@gmail.com",
    name: data?.name || "Third Eye Developer",
    avatar:
      data?.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80",
    phone: data?.phone || "+1 (555) 019-2834",
  };

  const result = await request<AuthResponse>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (result.success && result.token && result.user) {
    setSession(result.token, result.user);
  }

  return result;
}

export async function continueWithApple(data?: {
  appleId?: string;
  email?: string;
  name?: string;
  phone?: string;
}): Promise<AuthResponse> {
  const payload = {
    appleId: data?.appleId || `apple_${Date.now()}`,
    email: data?.email || "apple.developer@icloud.com",
    name: data?.name || "Apple Creator",
    phone: data?.phone || "+1 (555) 982-1142",
  };

  const result = await request<AuthResponse>("/api/auth/apple", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (result.success && result.token && result.user) {
    setSession(result.token, result.user);
  }

  return result;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredToken();

  if (!token) {
    clearSession();
    return null;
  }

  try {
    const result = await request<{
      success: boolean;
      user?: AuthUser;
    }>("/api/auth/me");

    if (result.success && result.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      notifyListeners(result.user);

      return result.user;
    }

    clearSession();
    return null;
  } catch {
    // Preserve the existing cached-user fallback for temporary failures.
    return getStoredUser();
  }
}
