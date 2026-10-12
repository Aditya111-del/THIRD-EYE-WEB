export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  authProvider: 'local' | 'google' | 'apple';
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

const TOKEN_KEY = 'thirdeye_auth_token';
const USER_KEY = 'thirdeye_auth_user';

// Fallback to relative URL or backend port 5001
const API_URL = typeof window !== 'undefined' && window.location.port === '5001'
  ? ''
  : ((import.meta.env['VITE_API_BASE_URL'] as string | undefined) || 'http://localhost:5001');

type AuthListener = (user: AuthUser | null) => void;
const listeners = new Set<AuthListener>();

export function subscribeAuth(listener: AuthListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(user: AuthUser | null) {
  listeners.forEach((cb) => {
    try {
      cb(user);
    } catch (e) {
      console.error(e);
    }
  });
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyListeners(user);
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyListeners(null);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Try API_URL first, fallback to direct /api/ if needed
  const url = `${API_URL}${endpoint}`;
  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    // If localhost:5001 fetch fails (e.g. CORS or network), try relative proxy /api
    if (API_URL) {
      res = await fetch(endpoint, { ...options, headers });
    } else {
      throw err;
    }
  }

  const data = await res.json().catch(() => ({
    success: false,
    message: `Server returned HTTP ${res.status}`,
  }));

  if (!res.ok && !data.error && !data.message) {
    throw new Error(`HTTP Error ${res.status}`);
  }

  return data;
}

export async function registerUser(body: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<AuthResponse> {
  const result = await request<AuthResponse>('/api/auth/register', {
    method: 'POST',
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
  const result = await request<AuthResponse>('/api/auth/login', {
    method: 'POST',
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
    email: data?.email || 'developer.thirdeye@gmail.com',
    name: data?.name || 'Third Eye Developer',
    avatar: data?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
    phone: data?.phone || '+1 (555) 019-2834',
  };

  const result = await request<AuthResponse>('/api/auth/google', {
    method: 'POST',
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
    email: data?.email || 'apple.developer@icloud.com',
    name: data?.name || 'Apple Creator',
    phone: data?.phone || '+1 (555) 982-1142',
  };

  const result = await request<AuthResponse>('/api/auth/apple', {
    method: 'POST',
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
    const res = await request<{ success: boolean; user?: AuthUser }>('/api/auth/me');
    if (res.success && res.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      notifyListeners(res.user);
      return res.user;
    }
    clearSession();
    return null;
  } catch {
    // If backend is temporarily unreachable, fallback to cached user
    return getStoredUser();
  }
}
