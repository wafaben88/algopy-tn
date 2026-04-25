"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, ArrowRight, Clock, Sparkles } from "lucide-react";
import { LEVELS } from "@/lib/curriculum";
import { useProgressStore } from "@/lib/store/useProgressStore";
import { cn } from "@/lib/utils/cn";

export default function CoursesPage() {
  const completed = useProgressStore((s) => s.completedLessons);

  const isUnlocked = useMemo(() => {
    return (lessonId: string) => {
      const all = LEVELS.flatMap((l) =>
        l.chapters.flatMap((c) => c.lessons.map((x) => x.id)),
      );
      const idx = all.indexOf(lessonId);
      if (idx <= 0) return true;
      // Unlock if all previous lessons in the same level are done, OR if you've
      // completed the immediately preceding lesson.
      const prev = all[idx - 1];
      return completed.includes(prev) || completed.length >= idx;
    };
  }, [completed]);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">
          Les <span className="gradient-text">cours</span>
        </h1>
        <p className="text-[var(--muted)]">
          Parcours aligné sur le programme officiel tunisien d&apos;informatique au
          lycée. Chaque leçon = pseudo-code tunisien + équivalent Python +
          exercices interactifs.
        </p>
      </header>

      {LEVELS.map((lvl) => (
        <section key={lvl.id} id={lvl.id} className="space-y-4 scroll-mt-24">
          <div
            className={cn(
              "rounded-2xl border border-[var(--border)] p-5 bg-gradient-to-r",
              lvl.color,
              "relative overflow-hidden",
            )}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{lvl.emoji}</span>
                <div>
                  <div className="text-xs uppercase tracking-widest text-white/70">
                    {lvl.subtitle}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{lvl.title}</h2>
                </div>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-white/90">
                {lvl.description}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {lvl.chapters.map((ch, i) => {
              const total = ch.lessons.length;
              const done = ch.lessons.filter((l) => completed.includes(l.id)).length;
              const pct = total ? (done / total) * 100 : 0;
              return (
                <motion.div
                  key={ch.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="panel-solid p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-[var(--primary)]/30 to-[var(--accent)]/20 text-2xl">
                      {ch.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold">{ch.title}</h3>
                      <p className="text-sm text-[var(--muted)]">{ch.description}</p>
                    </div>
                    <span className="chip">
                      {done}/{total}
                    </span>
                  </div>

                  <div className="my-3 h-2 overflow-hidden rounded-full bg-[var(--background)]">
                    <div
                      className={`h-full bg-gradient-to-r ${lvl.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <ul className="space-y-1.5">
                    {ch.lessons.map((lesson) => {
                      const isDone = completed.includes(lesson.id);
                      const unlocked = isUnlocked(lesson.id);
                      return (
                        <li key={lesson.id}>
                          <Link
                            href={unlocked ? `/cours/${lesson.id}` : "#"}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                              !unlocked && "pointer-events-none opacity-50",
                              isDone
                                ? "bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15"
                                : "hover:bg-[var(--card-hover)]",
                            )}
                          >
                            {!unlocked ? (
                              <Lock className="size-4 text-[var(--muted)]" />
                            ) : isDone ? (
                              <CheckCircle2 className="size-4 text-emerald-400" />
                            ) : (
                              <Sparkles className="size-4 text-[var(--primary-glow)]" />
                            )}
                            <span className="flex-1 truncate">{lesson.title}</span>
                            <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                              <Clock className="size-3" />
                              {lesson.estimatedMinutes}min
                            </span>
                            <span className="chip-accent chip text-[10px]">
                              +{lesson.xp} XP
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                    {ch.boss && (
                      <li>
                        <Link
                          href={`/defis/boss/${ch.boss.id}`}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/30 px-3 py-2 text-sm font-semibold hover:from-amber-500/25 hover:to-rose-500/25"
                        >
                          👑 <span className="flex-1">{ch.boss.title}</span>
                          <ArrowRight className="size-4" />
                        </Link>
                      </li>
                    )}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
