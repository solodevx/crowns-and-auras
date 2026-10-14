"use client";

import { useState } from "react";
import { loginAction } from "@/app/admin/login/actions";

const inputClassName =
  "mt-1 h-11 w-full rounded border border-ink/20 bg-white px-3";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await loginAction({ email, password });
      // On success the server redirects us away, so we only land here on failure
      if (result && !result.ok) {
        setErrorMessage(result.message);
        setIsSubmitting(false);
      }
    } catch {
      setErrorMessage("Could not reach the server. Try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} method="post" className="mt-6 space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClassName}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded bg-ink text-sm text-cream disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p role="alert" className="text-sm text-red-700">
        {errorMessage}
      </p>
    </form>
  );
}
