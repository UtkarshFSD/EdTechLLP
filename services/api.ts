import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://api.freeapi.app/api/v1";
const TOKEN_KEY = "auth_token";

// ─── Custom Error ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Body = Record<string, unknown> | FormData;

async function getAuthHeaders(isFormData: boolean): Promise<HeadersInit> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return {
    Accept: "application/json",
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as unknown as T;

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (isJson && (payload as { message?: string })?.message) ||
      res.statusText ||
      "Something went wrong";
    throw new ApiError(res.status, message, payload);
  }

  // freeapi.app wraps every response: { statusCode, data, message, success }
  // Unwrap `data` when present so callers receive the inner payload directly.
  if (
    isJson &&
    payload !== null &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

// ─── Core request — with one silent token-refresh retry on 401 ────────────────

async function send<T>(
  method: string,
  endpoint: string,
  body?: Body,
  isRetry = false,
): Promise<T> {
  const isFormData = body instanceof FormData;
  const headers = await getAuthHeaders(isFormData);

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  // Silent token refresh: attempt once then retry
  if (res.status === 401 && !isRetry) {
    try {
      const refreshRes = await fetch(`${BASE_URL}/users/refresh-token`, {
        method: "POST",
        headers: await getAuthHeaders(false),
      });

      if (refreshRes.ok) {
        const { token } = await refreshRes.json();
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        return send<T>(method, endpoint, body, true); // retry original
      }
    } catch {
      // refresh failed — fall through and let the 401 throw
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  return parseResponse<T>(res);
}

// ─── Public API Client ────────────────────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string) => send<T>("GET", endpoint),
  post: <T>(endpoint: string, body?: Body) => send<T>("POST", endpoint, body),
  put: <T>(endpoint: string, body?: Body) => send<T>("PUT", endpoint, body),
  patch: <T>(endpoint: string, body?: Body) => send<T>("PATCH", endpoint, body),
  delete: <T>(endpoint: string) => send<T>("DELETE", endpoint),
};
