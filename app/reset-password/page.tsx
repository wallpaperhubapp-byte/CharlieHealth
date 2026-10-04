"use client";

import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Those passwords don’t match.");
      return;
    }
    setLoading(true);
    try {
      const csrfResponse = await fetch("/api/auth/csrf", { cache: "no-store" });
      const { csrfToken } = await csrfResponse.json();
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error ?? "This reset link is no longer available.",
        );
      setSuccess(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Password reset is temporarily unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="reset-screen">
      <section className="reset-card">
        <a className="reset-brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            charlie<span>health</span>
          </span>
        </a>
        {success ? (
          <>
            <div className="reset-success">
              <CheckCircle2 size={24} />
            </div>
            <span className="eyebrow">ACCOUNT SECURITY</span>
            <h1>Password updated.</h1>
            <p>
              Your password has been changed and other active sessions have been
              signed out.
            </p>
            <a className="primary-button" href="/">
              Return to secure sign in <ArrowRight size={15} />
            </a>
          </>
        ) : (
          <>
            <div className="eyebrow">
              <ShieldCheck size={14} /> SECURE ACCOUNT RECOVERY
            </div>
            <h1>Set a new password.</h1>
            <p>
              Choose a unique password with at least 12 characters, including
              uppercase, lowercase and a number.
            </p>
            {token ? (
              <form className="reset-form" onSubmit={submit}>
                <label>
                  New password
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>
                <label>
                  Confirm new password
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                  />
                </label>
                {error && (
                  <span role="alert" className="reset-error">
                    {error}
                  </span>
                )}
                <button className="primary-button" disabled={loading}>
                  {loading ? "Updating…" : "Update password"}
                  <ArrowRight size={15} />
                </button>
              </form>
            ) : (
              <div role="alert" className="reset-error">
                This reset link is missing or invalid. Request a new link from
                the <a href="/">sign-in page</a>.
              </div>
            )}
            <div className="reset-note">
              <ShieldCheck size={14} /> Reset links expire after 30 minutes and
              can only be used once.
            </div>
          </>
        )}
      </section>
    </main>
  );
}
