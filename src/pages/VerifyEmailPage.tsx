import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useSearchParams,
} from "react-router";
import {
  confirmEmailVerification,
} from "../api/authApi";
import { ApiError } from "../types/api";

type VerificationStatus =
  | "verifying"
  | "success"
  | "error";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();

  const token =
    searchParams.get("token")?.trim() ?? "";

  const [status, setStatus] =
    useState<VerificationStatus>(
      "verifying",
    );

  const [message, setMessage] =
    useState("");

  const [attempt, setAttempt] =
    useState(0);

  useEffect(() => {
    let active = true;

    if (!token) {
      setStatus("error");
      setMessage(
        "The verification link is missing its token.",
      );
      return;
    }

    setStatus("verifying");
    setMessage("");

    void confirmEmailVerification(token)
      .then(() => {
        if (active) {
          setStatus("success");
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setStatus("error");

        if (error instanceof ApiError) {
          setMessage(error.message);
        } else {
          setMessage(
            "Unable to verify your email right now.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [token, attempt]);

  return (
    <main className="login-page">
      <section className="login-panel signup-panel">
        <div className="brand-mark">
          CampusHub
        </div>

        {status === "verifying" && (
          <>
            <div
              className="auth-status-spinner"
              aria-hidden="true"
            />

            <h1>Verifying your email</h1>

            <p className="muted-text">
              This should only take a moment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              className="auth-success-icon"
              aria-hidden="true"
            >
              ✓
            </div>

            <h1>Email verified</h1>

            <p className="muted-text">
              Your CampusHub account is ready.
              You can now sign in.
            </p>

            <Link
              className="auth-primary-link"
              to="/login"
            >
              Continue to sign in
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div
              className="auth-error-icon"
              aria-hidden="true"
            >
              !
            </div>

            <h1>Verification failed</h1>

            <p
              className="form-error auth-status-message"
              role="alert"
            >
              {message}
            </p>

            {token && (
              <button
                type="button"
                className="auth-retry-button"
                onClick={() =>
                  setAttempt(
                    (current) => current + 1,
                  )
                }
              >
                Try again
              </button>
            )}

            <Link
              className="auth-secondary-link"
              to="/login"
            >
              Return to sign in
            </Link>
          </>
        )}
      </section>
    </main>
  );
}