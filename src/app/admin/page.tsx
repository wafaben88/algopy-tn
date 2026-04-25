"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { AdminChaptersPanel } from "@/components/admin/AdminChaptersPanel";

export default function AdminHome() {
  return (
    <RequireAuth role="admin">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Admin · Dashboard</h1>
          <p className="text-sm text-zinc-400">
            Gère les chapitres, sections et leçons de la plateforme.
          </p>
        </header>
        <AdminChaptersPanel />
      </div>
    </RequireAuth>
  );
}
