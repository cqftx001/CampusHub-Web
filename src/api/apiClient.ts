import { accessTokenStore } from "../auth/accessTokenStore";
import type { ApiResponse } from "../types/api";
import { ApiError } from "../types/api";
import type { AuthSession } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const AUTH_EXPIRED_EVENT = "campushub:auth-expired";

interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
}

let refreshPromise: Promise<void> | null = null;

async function parseResponse<T>(
  response: Response,
): Promise<ApiResponse<T>> {
  let body: ApiResponse<T>;

  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      response.status,
      "CLIENT_INVALID_RESPONSE",
      "The server returned an invalid response.",
    );
  }

  if (!response.ok || body.code !== "0000") {
    throw new ApiError(
      response.status,
      body.code,
      body.message,
      body.requestId,
    );
  }

  return body;
}

async function requestNewAccessToken(): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/token/refresh`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const result = await parseResponse<AuthSession>(response);

  accessTokenStore.set(result.data.accessToken);
}

function isTerminalAuthenticationError(
  error: unknown,
): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  );
}

async function refreshOnce(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken()
      .catch((error: unknown) => {
        if (isTerminalAuthenticationError(error)) {
          accessTokenStore.clear();

          window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT), );
        }

        throw error;
      })
      .finally(() => {refreshPromise = null;});
  }

  return refreshPromise;
}

export async function restoreAccessToken(): Promise<void> {
  await refreshOnce();
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const {
    auth = true,
    retryOnUnauthorized = true,
    headers,
    ...requestOptions
  } = options;

  const requestHeaders = new Headers(headers);

  if (
    requestOptions.body &&
    !(requestOptions.body instanceof FormData) &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set(
      "Content-Type",
      "application/json",
    );
  }

  if (auth) {
    const accessToken = accessTokenStore.get();

    if (accessToken) {
      requestHeaders.set(
        "Authorization",
        `Bearer ${accessToken}`,
      );
    }
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...requestOptions,
      credentials:
        requestOptions.credentials ?? "include",
      headers: requestHeaders,
    },
  );

  if (
    response.status === 401 &&
    auth &&
    retryOnUnauthorized
  ) {
    await refreshOnce();

    return apiRequest<T>(path, {
      ...options,
      retryOnUnauthorized: false,
    });
  }

  return parseResponse<T>(response);
}