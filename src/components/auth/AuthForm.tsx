"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthError, login, signup } from "@/store/authSlice";
import Alert from "@/components/ui/Alert";

interface AuthFormProps {
  mode: "login" | "signup";
  next: string;
}

export default function AuthForm({ mode, next }: AuthFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error, fieldErrors } = useAppSelector((s) => s.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch, mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const action = isSignup ? signup({ name, email, password }) : login({ email, password });
    const result = await dispatch(action);
    if (result.meta.requestStatus === "fulfilled") {
      setRedirecting(true);
      router.replace(next);
      router.refresh();
    }
  }

  const busy = status === "loading" || redirecting;
  const switchHref = `${isSignup ? "/login" : "/signup"}${next === "/projects" ? "" : `?next=${encodeURIComponent(next)}`}`;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
          P
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isSignup ? "Start organising your projects and tasks." : "Log in to manage your projects."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-6" noValidate>
        {error && <Alert>{error}</Alert>}

        {isSignup && (
          <div>
            <label htmlFor="name" className="label">
              Name
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={busy}
            />
            {fieldErrors?.name && <p className="field-error">{fieldErrors.name[0]}</p>}
          </div>
        )}

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={busy}
          />
          {fieldErrors?.email && <p className="field-error">{fieldErrors.email[0]}</p>}
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isSignup ? 8 : undefined}
            disabled={busy}
          />
          {isSignup && !fieldErrors?.password && <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>}
          {fieldErrors?.password && <p className="field-error">{fieldErrors.password[0]}</p>}
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {isSignup ? "Already have an account?" : "New here?"}{" "}
        <Link href={switchHref} className="font-medium text-indigo-600 hover:text-indigo-500">
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
