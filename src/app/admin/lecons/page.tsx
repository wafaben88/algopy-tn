"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AdminLessonEditor } from "@/components/admin/AdminLessonEditor";

function Inner() {
  const params = useSearchParams();
  const idStr = params.get("id");
  const id = idStr ? Number(idStr) : NaN;

  if (!idStr || Number.isNaN(id)) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm">
        Aucune leçon sélectionnée.{" "}
        <Link href="/admin" className="text-violet-400 underline">
          Retour au dashboard
        </Link>
      </div>
    );
  }

  return <AdminLessonEditor lessonId={id} />;
}

export default function AdminLessonPage() {
  return (
    <RequireAuth role="admin">
      <div className="mx-auto max-w-5xl">
        <Suspense fallback={<div className="py-24 text-center text-sm text-zinc-400">Chargement…</div>}>
          <Inner />
        </Suspense>
      </div>
    </RequireAuth>
  );
}
