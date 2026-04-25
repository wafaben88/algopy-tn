"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { LEVELS } from "@/lib/curriculum";
import { ExerciseRunner } from "@/components/exercise/ExerciseRunner";
import { useProgressStore } from "@/lib/store/useProgressStore";
import { cn } from "@/lib/utils/cn";
import type { Exercise, Lesson, LevelId } from "@/lib/curriculum/types";

interface ExerciseEntry {
  exercise: Exercise;
  lesson: Lesson;
  levelId: LevelId;
}

export default function ExercisesPage() {
  const [filter, setFilter] = useState<"all" | "mcq" | "code" | "fill" | "order" | "multi-mcq">(
    "all",
  );
  const [difficulty, setDifficulty] = useState<"all" | "facile" | "moyen" | "difficile">("all");
  const [levelFilter, setLevelFilter] = useState<"all" | LevelId>("all");
  const [query, setQuery] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);

  const completedExercises = useProgressStore((s) => s.completedExercises);

  const all = useMemo<ExerciseEntry[]>(() => {
    const entries: ExerciseEntry[] = [];
    for (const level of LEVELS) {
      for (const chapter of level.chapters) {
        for (const lesson of chapter.lessons) {
          for (const exercise of lesson.exercises) {
            entries.push({ exercise, lesson, levelId: level.id });
          }
        }
      }
    }
    return entries;
  }, []);

  const filtered = useMemo(() => {
    return all.filter(({ exercise, lesson, levelId }) => {
      if (filter !== "all" && exercise.type !== filter) return false;
      if (difficulty !== "all" && exercise.difficulty !== difficulty) return false;
      if (levelFilter !== "all" && levelId !== levelFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !exercise.prompt.toLowerCase().includes(q) &&
          !lesson.title.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [all, filter, difficulty, levelFilter, query]);

  const current = filtered[currentIdx];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">
          Les <span className="gradient-text">exercices</span>
        </h1>
        <p className="text-[var(--muted)]">
          {all.length} exercices disponibles. Filtre par type, niveau ou difficulté.
        </p>
      </header>

      {/* Filters */}
      <div className="panel-solid p-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentIdx(0);
            }}
            placeholder="Rechercher..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Group label="Type">
            {(["all", "mcq", "multi-mcq", "fill", "order", "code"] as const).map((t) => (
              <Pill key={t} active={filter === t} onClick={() => { setFilter(t); setCurrentIdx(0); }}>
                {t === "all" ? "Tous" : t}
              </Pill>
            ))}
          </Group>
          <Group label="Difficulté">
            {(["all", "facile", "moyen", "difficile"] as const).map((d) => (
              <Pill key={d} active={difficulty === d} onClick={() => { setDifficulty(d); setCurrentIdx(0); }}>
                {d === "all" ? "Toutes" : d}
              </Pill>
            ))}
          </Group>
          <Group label="Niveau">
            <Pill active={levelFilter === "all"} onClick={() => { setLevelFilter("all"); setCurrentIdx(0); }}>Tous</Pill>
            {LEVELS.map((l) => (
              <Pill
                key={l.id}
                active={levelFilter === l.id}
                onClick={() => { setLevelFilter(l.id); setCurrentIdx(0); }}
              >
                {l.emoji} {l.id === "niveau1" ? "2ème" : l.id === "niveau2" ? "3ème" : "Bac"}
              </Pill>
            ))}
          </Group>
        </div>
      </div>

      {/* List + Current */}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="panel-solid max-h-[70vh] overflow-auto p-3">
          <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {filtered.length} exercice{filtered.length !== 1 ? "s" : ""}
          </div>
          <ul className="space-y-1">
            {filtered.map(({ exercise, lesson }, i) => {
              const active = i === currentIdx;
              const done = completedExercises.includes(exercise.id);
              return (
                <li key={exercise.id}>
                  <button
                    onClick={() => setCurrentIdx(i)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                      active
                        ? "bg-[var(--primary)]/20 text-white"
                        : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-white",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "grid size-4 place-items-center rounded-full text-[10px]",
                          done ? "bg-emerald-500 text-white" : "bg-[var(--border)] text-[var(--muted)]",
                        )}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      <span className="truncate font-medium">{exercise.type}</span>
                      <span className="ml-auto chip text-[10px]">+{exercise.xp}</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs opacity-70">{lesson.title}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          {current ? (
            <motion.div
              key={current.exercise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ExerciseRunner exercise={current.exercise} />
            </motion.div>
          ) : (
            <div className="panel-solid p-10 text-center text-[var(--muted)]">
              Aucun exercice pour ces filtres.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--muted)]">{label}:</span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition",
        active
          ? "border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary-glow)]"
          : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--card-hover)]",
      )}
    >
      {children}
    </button>
  );
}
