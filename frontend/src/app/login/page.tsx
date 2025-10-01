"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/lib/api";
import { auth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await AuthAPI.login({ username, password });
      const token = (res.data?.token ?? res.data) as string;
      auth.setToken(token);
      router.replace("/dashboard"); // si no tens dashboard encara, posa "/"
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error d'autenticació");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Inicia sessió</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full rounded-xl border p-3"
          placeholder="Usuari"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          className="w-full rounded-xl border p-3"
          type="password"
          placeholder="Contrasenya"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={submitting}
          className="w-full rounded-xl bg-slate-900 p-3 text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Entrant..." : "Entrar"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        No tens compte? <a className="underline" href="/register">Registra’t</a>
      </p>
    </main>
  );
}
