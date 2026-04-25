"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ai,
  exercises as exercisesApi,
  lessons as lessonsApi,
} from "@/lib/api/endpoints";
import type {
  ApiCorrection,
  ApiDifficulty,
  ApiExercise,
  ApiExerciseType,
  ApiLesson,
} from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { ProtectedCanvas } from "@/components/lesson/ProtectedCanvas";

export function AdminLessonEditor({ lessonId }: { lessonId: number }) {
  const [lesson, setLesson] = useState<ApiLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Editable fields
  const [title, setTitle] = useState("");
  const [theory, setTheory] = useState("");
  const [published, setPublished] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  // AI gen UI
  const [aiBusy, setAiBusy] = useState(false);
  const [aiCount, setAiCount] = useState(3);
  const [aiLevel, setAiLevel] = useState("lycée — 2ème info");
  const [aiType, setAiType] = useState<ApiExerciseType>("mixed");

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await lessonsApi.get(lessonId);
      setLesson(r.lesson);
      setTitle(r.lesson.title);
      setTheory(r.lesson.theory_content);
      setPublished(r.lesson.is_published);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  async function saveMeta() {
    if (!lesson) return;
    setSavingMeta(true);
    try {
      await lessonsApi.update(lessonId, {
        section_id: lesson.section_id,
        title,
        theory_content: theory,
        order: lesson.order,
        is_published: published,
      });
      await refresh();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur");
    } finally {
      setSavingMeta(false);
    }
  }

  async function onGenerateExercises() {
    if (!lesson) return;
    if (!theory.trim()) {
      alert("Renseigne d'abord le contenu théorique pour que l'IA s'en inspire.");
      return;
    }
    setAiBusy(true);
    try {
      // Save current theory first so the AI has the latest version.
      await lessonsApi.update(lessonId, {
        section_id: lesson.section_id,
        title,
        theory_content: theory,
        order: lesson.order,
        is_published: published,
      });
      await ai.generateExercises(lessonId, {
        n: aiCount,
        level: aiLevel,
        type: aiType,
      });
      await refresh();
    } catch (e) {
      alert(
        e instanceof ApiError
          ? `IA: ${e.message}`
          : "Erreur lors de l'appel IA.",
      );
    } finally {
      setAiBusy(false);
    }
  }

  if (loading) return <div className="py-12 text-sm text-zinc-400">Chargement…</div>;
  if (err) return <div className="text-rose-400">{err}</div>;
  if (!lesson) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-sm text-violet-400 hover:underline">
          ← Retour au dashboard
        </Link>
      </div>

      {/* --- Metadata --- */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-lg font-semibold">Leçon</h2>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-400">
              Titre
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-400">
              Contenu théorique (markdown)
            </span>
            <textarea
              value={theory}
              onChange={(e) => setTheory(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 font-mono text-sm"
              placeholder="Une introduction, des définitions, des exemples…"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Publié (visible aux élèves)
          </label>
          <div>
            <button
              onClick={saveMeta}
              disabled={savingMeta}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:opacity-50"
            >
              {savingMeta ? "Enregistrement…" : "Enregistrer la leçon"}
            </button>
          </div>
        </div>
      </section>

      {/* --- Images --- */}
      <ImagesPanel lesson={lesson} onChange={refresh} />

      {/* --- AI generation --- */}
      <section className="rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/10 to-pink-500/10 p-5">
        <h2 className="mb-1 text-lg font-semibold">Génération IA</h2>
        <p className="mb-3 text-xs text-zinc-400">
          Gemini 2.5 Flash analyse la théorie et génère des exercices dans le même
          esprit pédagogique. Ils arrivent en brouillon ; tu les valides ensuite.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-400">
              Nb d&apos;exercices
            </span>
            <input
              type="number"
              min={1}
              max={10}
              value={aiCount}
              onChange={(e) => setAiCount(Math.max(1, Math.min(10, Number(e.target.value) || 3)))}
              className="w-20 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-400">Niveau</span>
            <input
              value={aiLevel}
              onChange={(e) => setAiLevel(e.target.value)}
              className="w-64 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-400">Type</span>
            <select
              value={aiType}
              onChange={(e) => setAiType(e.target.value as ApiExerciseType)}
              className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-sm"
            >
              <option value="algorithm">Algorithme (pseudo-code)</option>
              <option value="python">Python</option>
              <option value="mixed">Mixte</option>
            </select>
          </label>
          <button
            onClick={onGenerateExercises}
            disabled={aiBusy}
            className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400 disabled:opacity-50"
          >
            {aiBusy ? "Génération…" : "Générer les exercices"}
          </button>
        </div>
      </section>

      {/* --- Exercises --- */}
      <ExercisesPanel lesson={lesson} onChange={refresh} />
    </div>
  );
}

function ImagesPanel({
  lesson,
  onChange,
}: {
  lesson: ApiLesson;
  onChange: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await lessonsApi.uploadImage(lesson.id, file);
      await onChange();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur d'upload");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(imageId: number) {
    if (!window.confirm("Supprimer cette image ?")) return;
    try {
      await lessonsApi.deleteImage(lesson.id, imageId);
      await onChange();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur");
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Images théoriques (protégées)</h2>
        <label className="cursor-pointer rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-400">
          {busy ? "Upload…" : "+ Uploader une image"}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onUpload}
            disabled={busy}
            className="hidden"
          />
        </label>
      </div>
      {(lesson.images ?? []).length === 0 ? (
        <p className="text-xs text-zinc-500">
          Aucune image. Les images uploadées sont rendues via canvas avec watermark
          au nom de l&apos;utilisateur connecté, et servies via JWT à TTL court.
        </p>
      ) : (
        <ul className="space-y-3">
          {lesson.images!.map((img) => (
            <li key={img.id} className="flex flex-wrap items-start gap-3">
              <ProtectedCanvas image={img} token={img.token} maxWidth={320} />
              <div className="text-xs text-zinc-300">
                <div className="font-medium">{img.filename}</div>
                <div className="text-zinc-500">
                  {img.width}×{img.height}, {img.mime_type}
                </div>
                <button
                  onClick={() => remove(img.id)}
                  className="mt-2 rounded-md border border-rose-500/50 px-2 py-0.5 text-xs text-rose-300"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ExercisesPanel({
  lesson,
  onChange,
}: {
  lesson: ApiLesson;
  onChange: () => Promise<void>;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="mb-3 text-lg font-semibold">Exercices</h2>
      {(lesson.exercises ?? []).length === 0 ? (
        <p className="text-xs text-zinc-500">
          Aucun exercice. Génère-les via IA ci-dessus, ou ajoute-les manuellement.
        </p>
      ) : (
        <ul className="space-y-3">
          {lesson.exercises!.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onChange={onChange}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ExerciseCard({
  exercise,
  onChange,
}: {
  exercise: ApiExercise;
  onChange: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [statement, setStatement] = useState(exercise.statement);
  const [type, setType] = useState<ApiExerciseType>(exercise.type);
  const [difficulty, setDifficulty] = useState<ApiDifficulty>(exercise.difficulty);
  const [published, setPublished] = useState(exercise.is_published);
  const [busy, setBusy] = useState(false);
  const [genBusy, setGenBusy] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await exercisesApi.update(exercise.id, {
        lesson_id: exercise.lesson_id,
        statement,
        type,
        difficulty,
        order: exercise.order,
        is_published: published,
      });
      setEditing(false);
      await onChange();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Supprimer cet exercice ?")) return;
    try {
      await exercisesApi.remove(exercise.id);
      await onChange();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur");
    }
  }

  async function generateCorrection() {
    setGenBusy(true);
    try {
      await ai.generateCorrection(exercise.id, true);
      await onChange();
      setShowCorrection(true);
    } catch (e) {
      alert(e instanceof ApiError ? `IA: ${e.message}` : "Erreur");
    } finally {
      setGenBusy(false);
    }
  }

  return (
    <li className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-zinc-700 px-2 py-0.5">#{exercise.order + 1}</span>
        <DifficultyBadge difficulty={difficulty} />
        <TypeBadge type={type} />
        {exercise.generated_by_ai ? (
          <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-violet-300">
            IA
          </span>
        ) : null}
        <span
          className={`rounded-full px-2 py-0.5 ${
            published
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-zinc-500/20 text-zinc-300"
          }`}
        >
          {published ? "publié" : "brouillon"}
        </span>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ApiExerciseType)}
              className="rounded-lg border border-white/10 bg-white/10 px-2 py-1"
            >
              <option value="algorithm">Algorithme</option>
              <option value="python">Python</option>
              <option value="mixed">Mixte</option>
            </select>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as ApiDifficulty)}
              className="rounded-lg border border-white/10 bg-white/10 px-2 py-1"
            >
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </select>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Publié
            </label>
            <button
              onClick={save}
              disabled={busy}
              className="rounded-md bg-emerald-500 px-3 py-1 text-xs text-white"
            >
              Enregistrer
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setStatement(exercise.statement);
                setType(exercise.type);
                setDifficulty(exercise.difficulty);
                setPublished(exercise.is_published);
              }}
              className="rounded-md border border-white/20 px-3 py-1 text-xs"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <pre className="whitespace-pre-wrap rounded-lg bg-black/30 p-3 text-sm text-zinc-200">
          {statement}
        </pre>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {!editing ? (
          <>
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-white/20 px-2 py-0.5"
            >
              Modifier
            </button>
            <button
              onClick={remove}
              className="rounded-md border border-rose-500/50 px-2 py-0.5 text-rose-300"
            >
              Supprimer
            </button>
            <button
              onClick={generateCorrection}
              disabled={genBusy}
              className="rounded-md bg-violet-500 px-3 py-0.5 text-white disabled:opacity-50"
            >
              {genBusy ? "Gen…" : exercise.correction ? "Re-générer correction" : "Générer correction (IA)"}
            </button>
            <button
              onClick={() => setShowCorrection((s) => !s)}
              className="rounded-md border border-white/20 px-2 py-0.5"
            >
              {showCorrection ? "Masquer" : "Voir"} la correction
            </button>
          </>
        ) : null}
      </div>

      {showCorrection && exercise.correction ? (
        <CorrectionView correction={exercise.correction} />
      ) : null}
    </li>
  );
}

function CorrectionView({ correction }: { correction: ApiCorrection }) {
  return (
    <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
      <div className="text-xs uppercase tracking-wide text-zinc-400">
        Correction {correction.generated_by_ai ? "(IA)" : "(manuelle)"}
      </div>
      {correction.content ? (
        <div className="whitespace-pre-wrap text-zinc-200">{correction.content}</div>
      ) : null}
      {correction.pseudocode ? (
        <details>
          <summary className="cursor-pointer text-xs text-violet-300">
            Pseudo-code
          </summary>
          <pre className="mt-1 overflow-x-auto rounded bg-black/40 p-2 text-xs">
            {correction.pseudocode}
          </pre>
        </details>
      ) : null}
      {correction.python_code ? (
        <details>
          <summary className="cursor-pointer text-xs text-violet-300">
            Python
          </summary>
          <pre className="mt-1 overflow-x-auto rounded bg-black/40 p-2 text-xs">
            {correction.python_code}
          </pre>
        </details>
      ) : null}
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: ApiDifficulty }) {
  const map = {
    easy: "bg-emerald-500/20 text-emerald-300",
    medium: "bg-amber-500/20 text-amber-300",
    hard: "bg-rose-500/20 text-rose-300",
  } as const;
  const label = { easy: "Facile", medium: "Moyen", hard: "Difficile" }[difficulty];
  return <span className={`rounded-full px-2 py-0.5 ${map[difficulty]}`}>{label}</span>;
}

function TypeBadge({ type }: { type: ApiExerciseType }) {
  const label = { algorithm: "Algo", python: "Python", mixed: "Mixte" }[type];
  return (
    <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-sky-300">{label}</span>
  );
}
