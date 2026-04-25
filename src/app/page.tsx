"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Swords,
  Trophy,
  Sparkles,
  Flame,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { LEVELS, getDailyChallenge } from "@/lib/curriculum";
import { useProgressStore } from "@/lib/store/useProgressStore";
import { levelFromXp } from "@/lib/gamification/xp";
import { BADGES } from "@/lib/gamification/badges";

export default function HomePage() {
  const {
    totalXp,
    streakDays,
    completedLessons,
    unlockedBadges,
    username,
  } = useProgressStore();
  const { title: levelTitle, level } = levelFromXp(totalXp);
  const daily = getDailyChallenge();

  const totalLessons = LEVELS.reduce(
    (acc, l) => acc + l.chapters.reduce((a, c) => a + c.lessons.length, 0),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--primary)]/20 via-transparent to-[var(--accent)]/10 p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="chip mb-4">
            <Sparkles className="size-3.5" /> Programme officiel tunisien 🇹🇳
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Salut <span className="gradient-text">{username}</span> !<br />
            <span className="text-[var(--muted)] text-xl md:text-3xl font-semibold">
              Prêt à devenir un pro de l&apos;algorithme ?
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-[var(--muted)]">
            Apprends l&apos;algorithmique et Python de la 2ème année au Bac
            Informatique, leçon par leçon. Gagne de l&apos;XP, débloque des
            badges, défie le chrono.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/cours" className="btn btn-primary">
              Commencer une leçon <ArrowRight className="size-4" />
            </Link>
            <Link href="/defis" className="btn btn-ghost">
              Défi du jour <Swords className="size-4" />
            </Link>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={<Zap className="size-5 text-amber-400" />}
            label="XP total"
            value={totalXp}
            accent="amber"
          />
          <StatCard
            icon={<Flame className="size-5 text-orange-400" />}
            label="Streak"
            value={`${streakDays}j`}
            accent="orange"
          />
          <StatCard
            icon={<CheckCircle2 className="size-5 text-emerald-400" />}
            label="Leçons"
            value={`${completedLessons.length}/${totalLessons}`}
            accent="emerald"
          />
          <StatCard
            icon={<Trophy className="size-5 text-cyan-400" />}
            label="Niveau"
            value={level}
            sub={levelTitle}
            accent="cyan"
          />
        </div>
      </section>

      {/* Levels */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Parcours d&apos;apprentissage</h2>
            <p className="text-sm text-[var(--muted)]">
              Trois niveaux. Des dizaines de leçons. Un objectif : exceller au Bac.
            </p>
          </div>
          <Link
            href="/cours"
            className="hidden md:inline-flex items-center gap-1 text-sm text-[var(--primary-glow)] hover:underline"
          >
            Voir tous les cours <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {LEVELS.map((lvl, i) => {
            const total = lvl.chapters.reduce(
              (a, c) => a + c.lessons.length,
              0,
            );
            const done = lvl.chapters.reduce(
              (a, c) =>
                a +
                c.lessons.filter((l) => completedLessons.includes(l.id)).length,
              0,
            );
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <motion.div
                key={lvl.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <Link
                  href={`/cours#${lvl.id}`}
                  className="panel-solid group block h-full p-5 transition-transform hover:-translate-y-1"
                >
                  <div
                    className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${lvl.color} px-3 py-1 text-xs font-semibold text-white`}
                  >
                    {lvl.subtitle}
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-3xl">{lvl.emoji}</span>
                    <h3 className="text-lg font-bold">{lvl.title}</h3>
                  </div>
                  <p className="mb-4 text-sm text-[var(--muted)]">
                    {lvl.description}
                  </p>
                  <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                    <span>
                      {done}/{total} leçons
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--background)]">
                    <div
                      className={`h-full bg-gradient-to-r ${lvl.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Daily challenge + Badges */}
      <section className="grid gap-4 md:grid-cols-3">
        {daily && (
          <Link
            href="/defis/quotidien"
            className="panel-solid group relative overflow-hidden p-5 md:col-span-2"
          >
            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-gradient-to-br from-[var(--accent-2)]/30 to-transparent blur-3xl" />
            <div className="chip chip-accent mb-2">
              <Swords className="size-3" /> Défi du jour
            </div>
            <h3 className="text-xl font-bold">
              Teste tes réflexes d&apos;algorithmicien
            </h3>
            <p className="mt-1 max-w-md text-sm text-[var(--muted)]">
              {daily.prompt}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="btn btn-primary group-hover:shadow-lg">
                Relever <ArrowRight className="size-4" />
              </span>
              <span className="chip chip-warning">+{daily.xp} XP</span>
            </div>
          </Link>
        )}

        <div className="panel-solid p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
              Badges
            </h3>
            <span className="text-xs text-[var(--muted)]">
              {unlockedBadges.length}/{BADGES.length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {BADGES.slice(0, 8).map((b) => {
              const unlocked = unlockedBadges.includes(b.id);
              return (
                <div
                  key={b.id}
                  title={`${b.title} — ${b.description}`}
                  className={`flex aspect-square items-center justify-center rounded-xl text-2xl transition-all ${
                    unlocked
                      ? "bg-gradient-to-br from-[var(--primary)]/30 to-[var(--accent)]/20 border border-[var(--primary)]/40"
                      : "bg-[var(--background)] border border-[var(--border)] grayscale opacity-40"
                  }`}
                >
                  {b.emoji}
                </div>
              );
            })}
          </div>
          <Link
            href="/profil"
            className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--primary-glow)] hover:underline"
          >
            Voir tous les badges <ArrowRight className="size-3" />
          </Link>
        </div>
      </section>

      {/* Next lesson / CTA */}
      <section className="panel-solid flex flex-col items-center justify-between gap-4 p-6 text-center md:flex-row md:text-left">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/10 p-3">
            <BookOpen className="size-7 text-[var(--primary-glow)]" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Continue ton parcours</h3>
            <p className="text-sm text-[var(--muted)]">
              {completedLessons.length === 0
                ? "Commence par la première leçon : Qu'est-ce qu'un algorithme ?"
                : "Reprends là où tu t'es arrêté(e)."}
            </p>
          </div>
        </div>
        <Link href="/cours" className="btn btn-primary">
          Aller aux cours <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-[var(--muted)]">{sub}</div>}
    </div>
  );
}
