import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://api.freeapi.app/api/v1";
const TOKEN_KEY = "auth_token";
export const REFRESH_TOKEN_KEY = "auth_refresh_token";

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

const DEFAULT_TIMEOUT = 10000;
const MAX_RETRIES = 2;

async function send<T>(
  method: string,
  endpoint: string,
  body?: Body,
  retryCount = 0,
): Promise<T> {
  const isFormData = body instanceof FormData;
  const headers = await getAuthHeaders(isFormData);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.status === 401 && retryCount === 0) {
      try {
        const storedRefreshToken =
          await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        const refreshRes = await fetch(`${BASE_URL}/users/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          ...(storedRefreshToken && {
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
          }),
        });

        if (refreshRes.ok) {
          const json = await refreshRes.json();
          const data = json?.data ?? json;
          const newAccessToken = data.accessToken ?? data.token;
          const newRefreshToken = data.refreshToken;

          await SecureStore.setItemAsync(TOKEN_KEY, newAccessToken);
          if (newRefreshToken) {
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
          }
          return send<T>(method, endpoint, body, 1);
        }
      } catch (err) {}
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }

    const shouldRetry =
      !res.ok &&
      res.status !== 401 &&
      res.status !== 403 &&
      res.status !== 404 &&
      retryCount < MAX_RETRIES;

    if (shouldRetry) {
      return send<T>(method, endpoint, body, retryCount + 1);
    }

    return parseResponse<T>(res);
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new ApiError(
        408,
        "Request timed out. Please check your connection.",
      );
    }

    if (retryCount < MAX_RETRIES) {
      return send<T>(method, endpoint, body, retryCount + 1);
    }

    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string) => send<T>("GET", endpoint),
  post: <T>(endpoint: string, body?: Body) => send<T>("POST", endpoint, body),
  put: <T>(endpoint: string, body?: Body) => send<T>("PUT", endpoint, body),
  patch: <T>(endpoint: string, body?: Body) => send<T>("PATCH", endpoint, body),
  delete: <T>(endpoint: string) => send<T>("DELETE", endpoint),
};
