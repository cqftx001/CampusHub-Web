import {
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  Navigate,
} from "react-router";
import { register } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../types/api";
import type {
  RegisteredAccount,
} from "../types/auth";

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*._-])[A-Za-z\d!@#$%^&*._-]+$/;

export function SignupPage() {
  const { isAuthenticated } = useAuth();

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [registeredAccount, setRegisteredAccount] =
    useState<RegisteredAccount | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  if (isAuthenticated) {
    return (
      <Navigate
        to="/marketplace"
        replace
      />
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage(
        "The passwords do not match.",
      );
      return;
    }

    if (!PASSWORD_PATTERN.test(password)) {
      setErrorMessage(
        "Password must contain uppercase, lowercase, numeric, and special characters.",
      );
      return;
    }

    if (
      new TextEncoder().encode(password).length >
      72
    ) {
      setErrorMessage(
        "Password cannot exceed 72 UTF-8 bytes.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const account = await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      setRegisteredAccount(account);

      // Do not retain credentials after registration.
      setPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Unable to create your account right now.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registeredAccount) {
    return (
      <main className="login-page">
        <section className="login-panel signup-panel">
          <div className="brand-mark">
            CampusHub
          </div>

          <div
            className="auth-success-icon"
            aria-hidden="true"
          >
            ✓
          </div>

          <h1>Check your email</h1>

          <p className="muted-text">
            We sent a verification link to{" "}
            <strong>
              {registeredAccount.email}
            </strong>
            . Verify your address before signing
            in.
          </p>

          <Link
            className="auth-primary-link"
            to="/login"
          >
            Return to sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="login-page">
      <section className="login-panel signup-panel">
        <div className="brand-mark">
          CampusHub
        </div>

        <h1>Create your account</h1>

        <p className="muted-text">
          Join your campus marketplace.
        </p>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <label>
            Username

            <input
              type="text"
              required
              minLength={3}
              maxLength={32}
              pattern="[A-Za-z0-9._-]+"
              autoComplete="username"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
            />

            <small className="form-hint">
              3–32 letters, numbers, dots,
              underscores, or hyphens.
            </small>
          </label>

          <label>
            Email

            <input
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </label>

          <label>
            Password

            <input
              type="password"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />

            <small className="form-hint">
              At least 8 characters with uppercase,
              lowercase, number, and special
              character.
            </small>
          </label>

          <label>
            Confirm password

            <input
              type="password"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
            />
          </label>

          {errorMessage && (
            <p
              className="form-error"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}