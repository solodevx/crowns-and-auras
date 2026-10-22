"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/admin/login/actions";

const inputClassName =
  "mt-1 h-11 w-full rounded border border-ink/20 bg-white px-3";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // True while the page is moving, and switches itself off when it arrives
  const [isNavigating, startNavigation] = useTransition();
  const isBusy = isSubmitting || isNavigating;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await loginAction({ email, password });
      if (result.ok) {
        setPassword(""); // never leave a password sitting in a hidden page
        startNavigation(() => {
          router.replace("/admin");
          router.refresh();
        });
        setIsSubmitting(false);
        return;
      }
      setErrorMessage(result.message);
    } catch {
      setErrorMessage("Could not reach the server. Try again.");
    }

    setIsSubmitting(false);
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
        disabled={isBusy}
        className="h-12 w-full rounded bg-ink text-sm text-cream disabled:opacity-60"
      >
        {isBusy ? "Signing in..." : "Sign in"}
      </button>

      <p role="alert" className="min-h-5 text-sm text-red-700">
        {errorMessage}
      </p>
    </form>
  );
}