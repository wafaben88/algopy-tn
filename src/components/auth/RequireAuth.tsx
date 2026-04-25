"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

type Props = {
  children: React.ReactNode;
  /** If "admin", requires the admin role. */
  role?: "admin";
};

/**
 * Client-side guard. Redirects to /login if the user is anonymous, or shows
 * an "access denied" panel if they don't have the required role.
 */
export function RequireAuth({ children, role }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(window.location.pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-md items-center justify-center py-24 text-sm text-zinc-400">
        Chargement…
      </div>
    );
  }
  if (!user) return null;

  if (role === "admin" && user.role !== "admin") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-rose-500/40 bg-rose-500/10 p-8 text-rose-100">
        <h1 className="mb-2 text-xl font-semibold">Accès refusé</h1>
        <p className="text-sm opacity-90">
          Cette section est réservée aux administrateurs. Demande à ton enseignant de
          mettre à jour ton compte.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
