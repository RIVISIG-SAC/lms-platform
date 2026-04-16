"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";

type ActionState = { error?: string } | null;

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    loginAction,
    null
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent placeholder:text-[var(--muted-foreground)]"
          placeholder="nombre@empresa.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent placeholder:text-[var(--muted-foreground)]"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-[var(--destructive)] bg-red-50 px-3 py-2 rounded-md">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[var(--primary)] text-white text-sm font-medium py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
