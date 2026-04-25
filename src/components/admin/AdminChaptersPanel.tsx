"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  chapters as chaptersApi,
  sections as sectionsApi,
  lessons as lessonsApi,
} from "@/lib/api/endpoints";
import type { ApiChapter, ApiLesson, ApiSection } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";

export function AdminChaptersPanel() {
  const [items, setItems] = useState<ApiChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await chaptersApi.list();
      // Sort by order asc, then id asc.
      const sorted = [...r.chapters].sort(
        (a, b) => a.order - b.order || a.id - b.id,
      );
      setItems(sorted);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  async function addChapter() {
    const title = window.prompt("Titre du nouveau chapitre ?");
    if (!title) return;
    try {
      await chaptersApi.create({
        title,
        order: items.length,
        is_published: false,
      });
      await refresh();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur");
    }
  }

  if (loading) return <div className="py-12 text-sm text-zinc-400">Chargement…</div>;
  if (err) return <div className="text-rose-400">{err}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={addChapter}
          className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-400"
        >
          + Nouveau chapitre
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center text-sm text-zinc-400">
          Aucun chapitre pour l&apos;instant. Crée le premier !
        </div>
      ) : (
        items.map((chapter) => (
          <ChapterCard key={chapter.id} chapter={chapter} onChange={refresh} />
        ))
      )}
    </div>
  );
}

function ChapterCard({
  chapter,
  onChange,
}: {
  chapter: ApiChapter;
  onChange: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chapter.title);
  const [description, setDescription] = useState(chapter.description ?? "");
  const [published, setPublished] = useState(chapter.is_published);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await chaptersApi.update(chapter.id, {
        title,
        description: description || null,
        order: chapter.order,
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
    if (!window.confirm(`Supprimer le chapitre « ${chapter.title} » ?`)) return;
    setBusy(true);
    try {
      await chaptersApi.remove(chapter.id);
      await onChange();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function addSection() {
    const t = window.prompt(`Titre de la nouvelle section dans « ${chapter.title} » ?`);
    if (!t) return;
    try {
      await sectionsApi.create({
        chapter_id: chapter.id,
        title: t,
        order: chapter.sections?.length ?? 0,
      });
      await onChange();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-semibold"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optionnelle)"
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                Publié
              </label>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold">
                {chapter.title}
                <PublishBadge published={chapter.is_published} />
              </h2>
              {chapter.description ? (
                <p className="text-sm text-zinc-400">{chapter.description}</p>
              ) : null}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <button
                onClick={save}
                disabled={busy}
                className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-400 disabled:opacity-50"
              >
                Enregistrer
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setTitle(chapter.title);
                  setDescription(chapter.description ?? "");
                  setPublished(chapter.is_published);
                }}
                className="rounded-lg border border-white/20 px-3 py-1 text-xs"
              >
                Annuler
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg border border-white/20 px-3 py-1 text-xs"
              >
                Modifier
              </button>
              <button
                onClick={remove}
                disabled={busy}
                className="rounded-lg border border-rose-500/50 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
              >
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {(chapter.sections ?? []).length === 0 ? (
          <p className="text-xs text-zinc-500">Aucune section.</p>
        ) : (
          chapter.sections!.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              onChange={onChange}
            />
          ))
        )}
        <button
          onClick={addSection}
          className="w-full rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5"
        >
          + Ajouter une section
        </button>
      </div>
    </div>
  );
}

function SectionRow({
  section,
  onChange,
}: {
  section: ApiSection;
  onChange: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await sectionsApi.update(section.id, {
        chapter_id: section.chapter_id,
        title,
        order: section.order,
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
    if (!window.confirm(`Supprimer la section « ${section.title} » ?`)) return;
    setBusy(true);
    try {
      await sectionsApi.remove(section.id);
      await onChange();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function addLesson() {
    const t = window.prompt(`Titre de la nouvelle leçon dans « ${section.title} » ?`);
    if (!t) return;
    try {
      await lessonsApi.create({
        section_id: section.id,
        title: t,
        theory_content: "",
        order: section.lessons?.length ?? 0,
        is_published: false,
      });
      await onChange();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur");
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-2">
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-sm"
          />
        ) : (
          <span className="text-sm font-medium">{section.title}</span>
        )}
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={save}
                disabled={busy}
                className="rounded-md bg-emerald-500 px-2 py-0.5 text-xs text-white"
              >
                OK
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setTitle(section.title);
                }}
                className="rounded-md border border-white/20 px-2 py-0.5 text-xs"
              >
                ×
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="rounded-md border border-white/20 px-2 py-0.5 text-xs"
              >
                Modifier
              </button>
              <button
                onClick={remove}
                className="rounded-md border border-rose-500/50 px-2 py-0.5 text-xs text-rose-300"
              >
                Suppr.
              </button>
            </>
          )}
        </div>
      </div>

      <ul className="mt-2 space-y-1">
        {(section.lessons ?? []).map((l) => (
          <LessonRow key={l.id} lesson={l} onChange={onChange} />
        ))}
        <li>
          <button
            onClick={addLesson}
            className="mt-1 w-full rounded-md border border-dashed border-white/15 px-2 py-1 text-[11px] text-zinc-300 hover:bg-white/5"
          >
            + Ajouter une leçon
          </button>
        </li>
      </ul>
    </div>
  );
}

function LessonRow({
  lesson,
  onChange,
}: {
  lesson: ApiLesson;
  onChange: () => Promise<void>;
}) {
  async function remove() {
    if (!window.confirm(`Supprimer la leçon « ${lesson.title} » ?`)) return;
    try {
      await lessonsApi.remove(lesson.id);
      await onChange();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erreur");
    }
  }
  return (
    <li className="flex items-center justify-between gap-2 rounded-md border border-white/5 bg-white/5 px-2 py-1 text-xs">
      <span className="truncate">
        {lesson.title}
        <PublishBadge published={lesson.is_published} small />
      </span>
      <span className="flex gap-2">
        <Link
          href={`/admin/lecons?id=${lesson.id}`}
          className="rounded-md border border-violet-400/40 px-2 py-0.5 text-violet-300 hover:bg-violet-500/10"
        >
          Éditer
        </Link>
        <button
          onClick={remove}
          className="rounded-md border border-rose-500/50 px-2 py-0.5 text-rose-300"
        >
          Suppr.
        </button>
      </span>
    </li>
  );
}

function PublishBadge({ published, small }: { published: boolean; small?: boolean }) {
  return (
    <span
      className={`ml-2 inline-block rounded-full px-2 py-0.5 ${
        small ? "text-[10px]" : "text-xs"
      } ${
        published
          ? "bg-emerald-500/20 text-emerald-300"
          : "bg-zinc-500/20 text-zinc-300"
      }`}
    >
      {published ? "publié" : "brouillon"}
    </span>
  );
}
