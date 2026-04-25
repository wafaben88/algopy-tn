"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { BADGES } from "@/lib/gamification/badges";
import { levelFromXp } from "@/lib/gamification/xp";

interface ToastEvent {
  id: string;
  type: "xp" | "badge" | "levelup" | "streak" | "error" | "info";
  title: string;
  subtitle?: string;
  emoji?: string;
  amount?: number;
}

interface ProgressState {
  username: string;
  avatar: string;

  totalXp: number;
  hearts: number;
  maxHearts: number;
  heartsRegenAt: number | null;

  streakDays: number;
  lastActivityIso: string | null;

  completedLessons: string[];
  completedExercises: string[];
  completedBosses: string[];
  perfectQuizzes: number;
  pythonRuns: number;
  challengesWon: number;

  unlockedBadges: string[];

  toasts: ToastEvent[];

  // actions
  setUsername: (name: string) => void;
  setAvatar: (avatar: string) => void;

  addXp: (amount: number, reason?: string) => void;
  completeLesson: (lessonId: string, xp: number) => void;
  completeExercise: (exerciseId: string, xp: number) => void;
  completeBoss: (bossId: string, xp: number, perfect: boolean) => void;
  recordPerfectQuiz: () => void;
  recordPythonRun: () => void;
  recordChallengeWin: () => void;

  loseHeart: () => void;
  refillHearts: () => void;
  tickHearts: () => void;

  pingActivity: () => void;

  pushToast: (t: Omit<ToastEvent, "id">) => void;
  dismissToast: (id: string) => void;

  checkBadges: () => void;
  reset: () => void;
}

const HEART_REGEN_MS = 30 * 60 * 1000; // 30 min
const MAX_HEARTS = 5;

function dayDiff(iso: string | null, now: Date): number {
  if (!iso) return Infinity;
  const then = new Date(iso);
  const a = Date.UTC(then.getUTCFullYear(), then.getUTCMonth(), then.getUTCDate());
  const b = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      username: "Élève",
      avatar: "🦉",
      totalXp: 0,
      hearts: MAX_HEARTS,
      maxHearts: MAX_HEARTS,
      heartsRegenAt: null,
      streakDays: 0,
      lastActivityIso: null,
      completedLessons: [],
      completedExercises: [],
      completedBosses: [],
      perfectQuizzes: 0,
      pythonRuns: 0,
      challengesWon: 0,
      unlockedBadges: [],
      toasts: [],

      setUsername: (name) => set({ username: name || "Élève" }),
      setAvatar: (avatar) => set({ avatar: avatar || "🦉" }),

      addXp: (amount, reason) => {
        const prevXp = get().totalXp;
        const newXp = prevXp + amount;
        set({ totalXp: newXp });
        if (amount > 0) {
          get().pushToast({
            type: "xp",
            title: `+${amount} XP`,
            subtitle: reason,
            emoji: "✨",
            amount,
          });
        }
        // Level up detection
        const before = levelFromXp(prevXp).level;
        const after = levelFromXp(newXp).level;
        if (after > before) {
          get().pushToast({
            type: "levelup",
            title: `Niveau ${after} atteint !`,
            subtitle: "Tu progresses 🚀",
            emoji: "🆙",
          });
        }
        get().checkBadges();
      },

      completeLesson: (lessonId, xp) => {
        const already = get().completedLessons.includes(lessonId);
        if (!already) {
          set({ completedLessons: [...get().completedLessons, lessonId] });
          get().addXp(xp, "Leçon terminée");
        }
        get().pingActivity();
      },

      completeExercise: (exerciseId, xp) => {
        const already = get().completedExercises.includes(exerciseId);
        if (!already) {
          set({ completedExercises: [...get().completedExercises, exerciseId] });
          get().addXp(xp, "Exercice réussi");
        }
        get().pingActivity();
      },

      completeBoss: (bossId, xp, perfect) => {
        const already = get().completedBosses.includes(bossId);
        if (!already) {
          set({ completedBosses: [...get().completedBosses, bossId] });
          get().addXp(xp, perfect ? "Boss parfait !" : "Boss vaincu");
        }
        if (perfect) get().recordPerfectQuiz();
        get().pingActivity();
      },

      recordPerfectQuiz: () => {
        set({ perfectQuizzes: get().perfectQuizzes + 1 });
        get().checkBadges();
      },

      recordPythonRun: () => {
        set({ pythonRuns: get().pythonRuns + 1 });
        get().checkBadges();
      },

      recordChallengeWin: () => {
        set({ challengesWon: get().challengesWon + 1 });
        get().checkBadges();
      },

      loseHeart: () => {
        const h = get().hearts;
        if (h <= 0) return;
        const nextHearts = h - 1;
        set({
          hearts: nextHearts,
          heartsRegenAt:
            nextHearts < get().maxHearts && !get().heartsRegenAt
              ? Date.now() + HEART_REGEN_MS
              : get().heartsRegenAt,
        });
      },

      refillHearts: () => set({ hearts: get().maxHearts, heartsRegenAt: null }),

      tickHearts: () => {
        const { hearts, maxHearts, heartsRegenAt } = get();
        if (hearts >= maxHearts || !heartsRegenAt) return;
        if (Date.now() >= heartsRegenAt) {
          const nextHearts = Math.min(maxHearts, hearts + 1);
          set({
            hearts: nextHearts,
            heartsRegenAt:
              nextHearts < maxHearts ? Date.now() + HEART_REGEN_MS : null,
          });
        }
      },

      pingActivity: () => {
        const now = new Date();
        const diff = dayDiff(get().lastActivityIso, now);
        let streak = get().streakDays;
        if (diff === 0) {
          // same day — nothing to do
        } else if (diff === 1) {
          streak += 1;
        } else {
          streak = 1;
        }
        const prevStreak = get().streakDays;
        set({ streakDays: streak, lastActivityIso: now.toISOString() });
        if (streak > prevStreak && streak >= 2) {
          get().pushToast({
            type: "streak",
            title: `Streak ${streak} jours 🔥`,
            subtitle: "Continue comme ça !",
            emoji: "🔥",
          });
        }
        get().checkBadges();
      },

      pushToast: (t) => {
        const toast: ToastEvent = { ...t, id: uid() };
        set({ toasts: [...get().toasts, toast] });
        setTimeout(() => get().dismissToast(toast.id), 3800);
      },

      dismissToast: (id) =>
        set({ toasts: get().toasts.filter((t) => t.id !== id) }),

      checkBadges: () => {
        const s = get();
        const ctx = {
          totalXp: s.totalXp,
          completedLessons: s.completedLessons,
          completedExercises: s.completedExercises,
          completedBosses: s.completedBosses,
          streakDays: s.streakDays,
          perfectQuizzes: s.perfectQuizzes,
          pythonRuns: s.pythonRuns,
          challengesWon: s.challengesWon,
        };
        const newlyUnlocked: string[] = [];
        for (const b of BADGES) {
          if (!s.unlockedBadges.includes(b.id) && b.check(ctx)) {
            newlyUnlocked.push(b.id);
          }
        }
        if (newlyUnlocked.length) {
          set({ unlockedBadges: [...s.unlockedBadges, ...newlyUnlocked] });
          for (const id of newlyUnlocked) {
            const def = BADGES.find((b) => b.id === id)!;
            s.pushToast({
              type: "badge",
              title: `Badge : ${def.title}`,
              subtitle: def.description,
              emoji: def.emoji,
            });
          }
        }
      },

      reset: () =>
        set({
          totalXp: 0,
          hearts: MAX_HEARTS,
          heartsRegenAt: null,
          streakDays: 0,
          lastActivityIso: null,
          completedLessons: [],
          completedExercises: [],
          completedBosses: [],
          perfectQuizzes: 0,
          pythonRuns: 0,
          challengesWon: 0,
          unlockedBadges: [],
          toasts: [],
        }),
    }),
    {
      name: "algopy-tn-progress",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        username: s.username,
        avatar: s.avatar,
        totalXp: s.totalXp,
        hearts: s.hearts,
        maxHearts: s.maxHearts,
        heartsRegenAt: s.heartsRegenAt,
        streakDays: s.streakDays,
        lastActivityIso: s.lastActivityIso,
        completedLessons: s.completedLessons,
        completedExercises: s.completedExercises,
        completedBosses: s.completedBosses,
        perfectQuizzes: s.perfectQuizzes,
        pythonRuns: s.pythonRuns,
        challengesWon: s.challengesWon,
        unlockedBadges: s.unlockedBadges,
      }),
    },
  ),
);
