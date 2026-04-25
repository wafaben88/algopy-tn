"use client";

import Link from "next/link";
import { Swords, Clock, Zap, ArrowRight } from "lucide-react";
import { LEVELS, getDailyChallenge } from "@/lib/curriculum";
import { useProgressStore } from "@/lib/store/useProgressStore";
import { motion } from "framer-motion";

export default function ChallengesPage() {
  const daily = getDailyChallenge();
  const completedBosses = useProgressStore((s) => s.completedBosses);

  const bosses = LEVELS.flatMap((l) =>
    l.chapters
      .filter((c) => c.boss)
      .map((c) => ({ level: l, chapter: c, boss: c.boss! })),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold">
          Les <span className="gradient-text">défis</span>
        </h1>
        <p className="text-[var(--muted)]">
          Prouve tes compétences sous pression : défis chronométrés et boss de chapitre.
        </p>
      </header>

      {/* Daily */}
      {daily && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-[var(--accent-2)]/30 bg-gradient-to-br from-[var(--accent-2)]/15 via-[var(--primary)]/10 to-transparent p-6 md:p-8"
        >
          <div className="absolute -right-10 -top-10 size-48 rounded-full bg-[var(--accent-2)]/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="chip chip-accent mb-2">
                <Swords className="size-3" /> Défi du jour
              </div>
              <h2 className="text-xl md:text-2xl font-bold">{daily.prompt}</h2>
              <div className="mt-3 flex items-center gap-2">
                <span className="chip">
                  <Zap className="size-3" /> +{daily.xp} XP
                </span>
                <span className="chip chip-warning">
                  <Clock className="size-3" /> 60 sec
                </span>
              </div>
            </div>
            <Link href="/defis/quotidien" className="btn btn-primary self-start">
              Relever le défi <ArrowRight className="size-4" />
            </Link>
          </div>
        </motion.section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-bold">Boss de chapitre 👑</h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          Chaque chapitre a son boss. Bats-les pour gagner un max d&apos;XP et
          débloquer le badge « Tombeur de boss ».
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bosses.map(({ level, chapter, boss }) => {
            const beaten = completedBosses.includes(boss.id);
            return (
              <Link
                key={boss.id}
                href={`/defis/boss/${boss.id}`}
                className="panel-solid group block overflow-hidden p-5 transition-transform hover:-translate-y-1"
              >
                <div className="mb-2 flex items-center gap-2 text-xs text-[var(--muted)]">
                  <span>{level.emoji}</span> {chapter.title}
                </div>
                <h3 className="text-lg font-bold">{boss.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">
                  {boss.description}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="chip chip-accent">
                    <Zap className="size-3" /> +{boss.xp} XP
                  </span>
                  <span className="chip chip-warning">
                    <Clock className="size-3" /> {boss.timeLimitSeconds}s
                  </span>
                  {beaten && <span className="chip chip-success">Vaincu ✓</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
