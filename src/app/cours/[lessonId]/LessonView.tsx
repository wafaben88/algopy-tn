"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { LessonContent } from "@/components/lesson/LessonContent";
import { ExerciseRunner } from "@/components/exercise/ExerciseRunner";
import { useProgressStore } from "@/lib/store/useProgressStore";
import type { Lesson, Chapter, Level } from "@/lib/curriculum/types";
import { getAllLessons } from "@/lib/curriculum";

interface Props {
  lesson: Lesson;
  chapter?: Chapter;
  level?: Level;
}

export function LessonView({ lesson, chapter, level }: Props) {
  const [phase, setPhase] = useState<"content" | "exercises" | "done">("content");
  const [exIdx, setExIdx] = useState(0);
  const [exDone, setExDone] = useState<Set<string>>(new Set());

  const completeLesson = useProgressStore((s) => s.completeLesson);
  const completed = useProgressStore((s) => s.completedLessons);
  const isCompleted = completed.includes(lesson.id);

  const allLessons = getAllLessons();
  const idx = allLessons.findIndex((l) => l.id === lesson.id);
  const next = allLessons[idx + 1];
  const prev = allLessons[idx - 1];

  const finish = () => {
    completeLesson(lesson.id, lesson.xp);
    setPhase("done");
  };

  const onExerciseSolved = (exId: string) => {
    setExDone((s) => {
      const ns = new Set(s);
      ns.add(exId);
      return ns;
    });
  };

  const allExercisesDone = lesson.exercises.every((e) => exDone.has(e.id));

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
        <Link href="/cours" className="hover:text-white">
          Cours
        </Link>
        <span>/</span>
        {level && (
          <>
            <Link href={`/cours#${level.id}`} className="hover:text-white">
              {level.subtitle}
            </Link>
            <span>/</span>
          </>
        )}
        {chapter && (
          <>
            <span>{chapter.title}</span>
            <span>/</span>
          </>
        )}
        <span className="text-[var(--foreground)] font-medium">{lesson.title}</span>
      </div>

      {/* Header */}
      <div className="panel-solid mb-6 p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="chip">
            <Clock className="size-3" /> {lesson.estimatedMinutes} min
          </span>
          <span className="chip chip-accent">
            <Zap className="size-3" /> +{lesson.xp} XP
          </span>
          {isCompleted && (
            <span className="chip chip-success">
              <CheckCircle2 className="size-3" /> Déjà terminée
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
        <p className="mt-1 text-[var(--muted)]">{lesson.objective}</p>

        {/* Progress tabs */}
        <div className="mt-5 flex gap-2">
          <TabBtn
            active={phase === "content"}
            onClick={() => setPhase("content")}
            label="📖 Cours"
          />
          <TabBtn
            active={phase === "exercises"}
            onClick={() => setPhase("exercises")}
            label={`💪 Exercices (${lesson.exercises.length})`}
          />
        </div>
      </div>

      {/* Content */}
      {phase === "content" && (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel-solid p-6"
        >
          <LessonContent sections={lesson.sections} />
          <div className="mt-8 flex justify-between">
            {prev ? (
              <Link href={`/cours/${prev.id}`} className="btn btn-ghost">
                <ArrowLeft className="size-4" /> Précédent
              </Link>
            ) : (
              <div />
            )}
            <button className="btn btn-primary" onClick={() => setPhase("exercises")}>
              Passer aux exercices <ArrowRight className="size-4" />
            </button>
          </div>
        </motion.div>
      )}

      {phase === "exercises" && (
        <motion.div
          key="ex"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--muted)]">
              Exercice {exIdx + 1} sur {lesson.exercises.length}
            </div>
            <div className="flex gap-1">
              {lesson.exercises.map((e, i) => (
                <button
                  key={e.id}
                  onClick={() => setExIdx(i)}
                  className={`size-2.5 rounded-full ${
                    exDone.has(e.id)
                      ? "bg-emerald-400"
                      : i === exIdx
                        ? "bg-[var(--primary-glow)]"
                        : "bg-[var(--border)]"
                  }`}
                  aria-label={`Exercice ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <ExerciseRunner
            exercise={lesson.exercises[exIdx]}
            onSolved={() => onExerciseSolved(lesson.exercises[exIdx].id)}
          />

          <div className="flex justify-between gap-2">
            <button
              className="btn btn-ghost"
              disabled={exIdx === 0}
              onClick={() => setExIdx(exIdx - 1)}
            >
              <ArrowLeft className="size-4" /> Précédent
            </button>
            {exIdx < lesson.exercises.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setExIdx(exIdx + 1)}
              >
                Suivant <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                disabled={!allExercisesDone && !isCompleted}
                onClick={finish}
              >
                <BookOpenCheck className="size-4" /> Terminer la leçon
              </button>
            )}
          </div>
          {!allExercisesDone && !isCompleted && exIdx === lesson.exercises.length - 1 && (
            <p className="text-center text-xs text-[var(--muted)]">
              Réussis tous les exercices pour valider la leçon.
            </p>
          )}
        </motion.div>
      )}

      {phase === "done" && (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="panel-solid p-8 text-center"
        >
          <div className="text-6xl">🎉</div>
          <h2 className="mt-3 text-2xl font-bold">Leçon terminée !</h2>
          <p className="mt-1 text-[var(--muted)]">
            Tu as gagné <span className="text-amber-400 font-semibold">+{lesson.xp} XP</span> sur cette leçon.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/cours" className="btn btn-ghost">
              <ArrowLeft className="size-4" /> Retour aux cours
            </Link>
            {next && (
              <Link href={`/cours/${next.id}`} className="btn btn-primary">
                Leçon suivante <ArrowRight className="size-4" />
              </Link>
            )}
            {chapter?.boss && (
              <Link
                href={`/defis/boss/${chapter.boss.id}`}
                className="btn btn-accent"
              >
                👑 Affronter le Boss
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-glow)] text-white"
          : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
