import { apiRequest } from "./apiClient";
import type {
  AuthSession,
  CurrentAccount,
  LoginRequest,
  RegisteredAccount,
  RegisterRequest,
} from "../types/auth";

export async function login(
  request: LoginRequest,
): Promise<AuthSession> {
  const response = await apiRequest<AuthSession>(
    "/api/auth/login",
    {
      method: "POST",
      auth: false,
      retryOnUnauthorized: false,
      body: JSON.stringify(request),
    },
  );

  return response.data;
}

export async function getCurrentAccount(): Promise<CurrentAccount> {
  const response =
    await apiRequest<CurrentAccount>("/api/auth/me");

  return response.data;
}

export async function logout(): Promise<void> {
  await apiRequest<null>("/api/auth/logout", {
    method: "POST",
  });
}

export async function register(
  request: RegisterRequest,
): Promise<RegisteredAccount> {
  const response =
    await apiRequest<RegisteredAccount>(
      "/api/auth/register",
      {
        method: "POST",
        auth: false,
        retryOnUnauthorized: false,
        body: JSON.stringify(request),
      },
    );

  return response.data;
}

export async function confirmEmailVerification(
  token: string,
): Promise<void> {
  await apiRequest<null>(
    "/api/auth/email-verification/confirm",
    {
      method: "POST",
      auth: false,
      retryOnUnauthorized: false,
      body: JSON.stringify({ token }),
    },
  );
}