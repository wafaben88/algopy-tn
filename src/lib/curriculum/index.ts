import type { Chapter, Exercise, Level, Lesson } from "./types";
import { niveau1Chapters } from "./niveau1";
import { niveau2Chapters } from "./niveau2";
import { niveau3Chapters } from "./niveau3";

export const LEVELS: Level[] = [
  {
    id: "niveau1",
    title: "Niveau 1 — 2ème année",
    subtitle: "2ème Sciences de l'informatique",
    description:
      "Les bases de l'algorithmique : variables, conditions, boucles. Parfait pour débuter.",
    color: "from-violet-500 to-fuchsia-500",
    emoji: "🌱",
    chapters: niveau1Chapters,
  },
  {
    id: "niveau2",
    title: "Niveau 2 — 3ème année",
    subtitle: "3ème Sciences de l'informatique",
    description:
      "Tableaux, fonctions, chaînes : passe à la vitesse supérieure.",
    color: "from-cyan-500 to-blue-500",
    emoji: "🚀",
    chapters: niveau2Chapters,
  },
  {
    id: "niveau3",
    title: "Niveau 3 — Bac Informatique",
    subtitle: "4ème Sciences de l'informatique",
    description:
      "Tris, recherche dichotomique, algorithmes avancés. Prêt pour le Bac !",
    color: "from-amber-500 to-rose-500",
    emoji: "👑",
    chapters: niveau3Chapters,
  },
];

export function getLevel(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getChapter(id: string): Chapter | undefined {
  for (const l of LEVELS) {
    const c = l.chapters.find((c) => c.id === id);
    if (c) return c;
  }
  return undefined;
}

export function getLesson(id: string): Lesson | undefined {
  for (const l of LEVELS) {
    for (const c of l.chapters) {
      const lesson = c.lessons.find((x) => x.id === id);
      if (lesson) return lesson;
    }
  }
  return undefined;
}

export function getAllLessons(): Lesson[] {
  return LEVELS.flatMap((l) => l.chapters.flatMap((c) => c.lessons));
}

export function getAllExercises(): Exercise[] {
  return getAllLessons().flatMap((l) => l.exercises);
}

export function getAllChapters(): Chapter[] {
  return LEVELS.flatMap((l) => l.chapters);
}

export function getBossByChapter(chapterId: string) {
  return getChapter(chapterId)?.boss;
}

export function getDailyChallenge() {
  // Deterministic-ish pick based on day number.
  const all = getAllExercises().filter(
    (e) => e.difficulty !== "facile" && e.type !== "code" && e.type !== "order",
  );
  if (!all.length) return null;
  const dayIdx = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return all[dayIdx % all.length];
}

export function findLessonByExerciseId(exerciseId: string): Lesson | undefined {
  for (const lesson of getAllLessons()) {
    if (lesson.exercises.some((e) => e.id === exerciseId)) return lesson;
  }
  return undefined;
}
