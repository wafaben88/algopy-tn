"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) {
      setErr("Mot de passe trop court (8 caractères minimum).");
      return;
    }
    setBusy(true);
    try {
      await register({ email: email.trim(), name: name.trim(), password });
      router.replace("/");
    } catch (e) {
      setErr(
        e instanceof ApiError ? e.message : "Erreur réseau, réessaie.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-3xl font-bold">Inscription</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Crée ton compte AlgoPy TN pour suivre tes progrès.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm">Nom</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </label>
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
            autoComplete="new-password"
            minLength={8}
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
          {busy ? "Création…" : "Créer mon compte"}
        </button>
      </form>
      <p className="mt-6 text-sm text-zinc-400">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-violet-400 underline">
          Se connecter
        </Link>
        .
      </p>
    </div>
  );
}
