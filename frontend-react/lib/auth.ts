const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const TOKEN_KEY = "paycash_token";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginData {
  access_token: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
    path: string;
  };
}

export interface Transaction {
  id: string;
  status: string;
  amount: number;
  phoneNumber: string;
  fees: number;
  createdAt: string;
}

interface TransactionsData {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function login(credentials: LoginCredentials): Promise<void> {
  const response = await fetch(`${GATEWAY_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Erreur ${response.status}`);
  }

  const json: ApiResponse<LoginData> = await response.json();
  setToken(json.data.access_token);
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function fetchTransactions(page = 1, limit = 10): Promise<TransactionsData> {
  const token = getToken();
  if (!token) throw new AuthError("Non authentifié");

  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await fetch(`${GATEWAY_URL}/api/transactions/transactions?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      throw new AuthError("Session expirée");
    }
    throw new Error(`Erreur ${response.status}`);
  }

  const json: ApiResponse<TransactionsData> = await response.json();
  return json.data;
}

export function logout(): void {
  removeToken();
}
