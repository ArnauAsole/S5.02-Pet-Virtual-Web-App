"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { CreaturesAPI } from "@/lib/api";

type Creature = {
  id: number;
  name: string;
  type: string;
  level: number;
  health: number;
  attack: number;
  defense: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Si no hi ha token → cap a login
  useEffect(() => {
    if (!auth.isAuthed()) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await CreaturesAPI.list();
        setCreatures(res.data as Creature[]);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Error carregant criatures");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Les meves criatures</h1>

      {loading && <p>Carregant…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && creatures.length === 0 && (
        <p>No tens cap criatura creada encara.</p>
      )}
      <ul className="grid gap-2">
        {creatures.map((c) => (
          <li key={c.id} className="rounded-xl border bg-white p-3">
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm text-slate-600">
              {c.type} · lvl {c.level} · ❤️ {c.health} · 🗡️ {c.attack} · 🛡️ {c.defense}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
