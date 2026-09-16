export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  sessionExpiresAt: string;
}

export interface CurrentAccount {
  accountId: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisteredAccount {
  accountId: string;
  username: string;
  email: string;
  emailVerificationRequired: boolean;
}