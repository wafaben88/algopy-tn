"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      // Send admins to /admin, students to the requested route or home.
      const dest = user.role === "admin" ? "/admin" : next;
      router.replace(dest);
    } catch (e) {
      setErr(
        e instanceof ApiError
          ? e.status === 401
            ? "Email ou mot de passe incorrect."
            : e.message
          : "Erreur réseau, réessaie.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-3xl font-bold">Connexion</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Entre tes identifiants pour accéder à AlgoPy TN.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm">Mot de passe</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </label>
        {err ? <div className="text-sm text-rose-400">{err}</div> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-violet-400 disabled:opacity-50"
        >
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="mt-6 text-sm text-zinc-400">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="text-violet-400 underline">
          Crée-en un
        </Link>
        .
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm text-zinc-400">Chargement…</div>}>
      <LoginInner />
    </Suspense>
  );
}
