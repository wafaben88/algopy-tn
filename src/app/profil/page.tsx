"use client";

import { useState } from "react";
import { Flame, Zap, Trophy, CheckCircle2, RotateCcw, Swords, BookOpen } from "lucide-react";
import { useProgressStore } from "@/lib/store/useProgressStore";
import { levelFromXp } from "@/lib/gamification/xp";
import { BADGES } from "@/lib/gamification/badges";
import { cn } from "@/lib/utils/cn";

const AVATARS = ["🦉", "🐼", "🦊", "🐯", "🐙", "🦄", "🦅", "🐲", "🧑‍💻", "🧕", "👨‍🎓", "👩‍🎓"];

export default function ProfilePage() {
  const {
    username,
    avatar,
    totalXp,
    hearts,
    maxHearts,
    streakDays,
    completedLessons,
    completedExercises,
    completedBosses,
    challengesWon,
    pythonRuns,
    unlockedBadges,
    setUsername,
    setAvatar,
    reset,
  } = useProgressStore();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(username);

  const { level, currentLevelXp, nextLevelXp, progress, title } =
    levelFromXp(totalXp);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Profile card */}
      <section className="panel-solid relative overflow-hidden p-6">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-[var(--primary)]/30 to-[var(--accent)]/10 blur-3xl" />
        <div className="relative flex flex-col items-center gap-4 md:flex-row md:items-start">
          <div className="grid size-24 place-items-center rounded-3xl bg-gradient-to-br from-[var(--primary)]/30 to-[var(--accent)]/20 text-5xl">
            {avatar}
          </div>
          <div className="flex-1 text-center md:text-left">
            {editingName ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setUsername(nameDraft);
                      setEditingName(false);
                    }
                  }}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-lg font-bold outline-none focus:border-[var(--primary)]"
                />
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setUsername(nameDraft);
                    setEditingName(false);
                  }}
                >
                  OK
                </button>
              </div>
            ) : (
              <h1
                className="cursor-pointer text-3xl font-bold hover:text-[var(--primary-glow)]"
                onClick={() => {
                  setEditingName(true);
                  setNameDraft(username);
                }}
                title="Cliquer pour modifier"
              >
                {username} ✎
              </h1>
            )}
            <div className="mt-1 text-[var(--muted)]">{title}</div>
            <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
              <span className="chip chip-accent">
                <Trophy className="size-3" /> Niveau {level}
              </span>
              <span className="chip">
                <Zap className="size-3" /> {totalXp} XP
              </span>
              <span className="chip chip-warning">
                <Flame className="size-3" /> {streakDays}j streak
              </span>
            </div>

            <div className="mt-4 max-w-md">
              <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                <span>Niveau {level}</span>
                <span>{currentLevelXp}/{nextLevelXp} XP</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--background)]">
                <div
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-glow)] transition-all"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 text-sm font-semibold text-[var(--muted)]">
            Choisir un avatar
          </div>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={cn(
                  "grid size-12 place-items-center rounded-xl border text-2xl transition",
                  avatar === a
                    ? "border-[var(--primary)] bg-[var(--primary)]/15"
                    : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]",
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-3 md:grid-cols-4">
        <StatBox icon={<BookOpen className="text-emerald-400" />} label="Leçons" value={completedLessons.length} />
        <StatBox icon={<CheckCircle2 className="text-cyan-400" />} label="Exercices" value={completedExercises.length} />
        <StatBox icon={<Trophy className="text-amber-400" />} label="Boss" value={completedBosses.length} />
        <StatBox icon={<Swords className="text-rose-400" />} label="Défis gagnés" value={challengesWon} />
      </section>

      {/* Badges */}
      <section className="panel-solid p-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold">Mes badges</h2>
            <p className="text-sm text-[var(--muted)]">
              {unlockedBadges.length} sur {BADGES.length} débloqués
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {BADGES.map((b) => {
            const on = unlockedBadges.includes(b.id);
            return (
              <div
                key={b.id}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition-all",
                  on
                    ? "border-[var(--primary)]/50 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/10"
                    : "border-[var(--border)] bg-[var(--background)] grayscale opacity-50",
                )}
              >
                <span className="text-4xl">{b.emoji}</span>
                <span className="text-xs font-semibold">{b.title}</span>
                <span className="text-[10px] text-[var(--muted)] leading-tight">
                  {b.description}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hearts info */}
      <section className="panel-solid p-5">
        <h3 className="mb-2 text-lg font-bold">❤️ Vies</h3>
        <p className="text-sm text-[var(--muted)]">
          Tu as <span className="text-rose-300 font-semibold">{hearts}/{maxHearts}</span> vies.
          Chaque mauvaise réponse coûte une vie, qui se régénère toutes les 30 minutes.
        </p>
      </section>

      {/* Danger zone */}
      <section className="panel-solid p-5">
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-rose-400">
          Réinitialiser
        </h3>
        <p className="mb-3 text-sm text-[var(--muted)]">
          Cela efface toute ta progression locale (XP, badges, leçons).
        </p>
        <button
          className="btn btn-ghost text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
          onClick={() => {
            if (confirm("Réinitialiser toute ta progression ?")) reset();
          }}
        >
          <RotateCcw className="size-4" /> Réinitialiser la progression
        </button>
      </section>

      <p className="text-center text-xs text-[var(--muted)]">
        Nombre d&apos;exécutions Python : {pythonRuns}
      </p>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="panel-solid p-4">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <span className="size-5">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
