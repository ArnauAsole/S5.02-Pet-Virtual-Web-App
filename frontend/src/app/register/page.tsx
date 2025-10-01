"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setOk(false);
    try {
      await AuthAPI.register({ username, password });
      setOk(true);
      router.replace("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "No s'ha pogut crear l'usuari");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Registre</h1>
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
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-emerald-700">Usuari creat! Redirigint…</p>}
        <button
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 p-3 text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Creant..." : "Crear compte"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Ja tens compte? <a className="underline" href="/login">Inicia sessió</a>
      </p>
    </main>
  );
}
