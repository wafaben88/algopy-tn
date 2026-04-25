"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, Swords, Trophy } from "lucide-react";
import type { BossBattle } from "@/lib/curriculum/types";
import { ExerciseRunner } from "@/components/exercise/ExerciseRunner";
import { useProgressStore } from "@/lib/store/useProgressStore";

export function BossView({
  boss,
  chapterTitle,
}: {
  boss: BossBattle;
  chapterTitle: string;
}) {
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(boss.timeLimitSeconds);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const completeBoss = useProgressStore((s) => s.completeBoss);

  useEffect(() => {
    if (!started || finished) return;
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          setFinished(true);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, finished]);

  const handleSolved = () => {
    setCorrect((c) => c + 1);
    if (idx < boss.questions.length - 1) {
      setTimeout(() => setIdx((i) => i + 1), 700);
    } else {
      setTimeout(() => setFinished(true), 700);
    }
  };

  useEffect(() => {
    if (finished) {
      const perfect = correct === boss.questions.length && timeLeft > 0;
      completeBoss(boss.id, perfect ? boss.xp : Math.round(boss.xp * (correct / boss.questions.length)), perfect);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link href="/defis" className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-white mb-4">
          <ArrowLeft className="size-4" /> Retour
        </Link>
        <div className="panel-solid p-8 text-center">
          <div className="text-5xl">👑</div>
          <h1 className="mt-3 text-2xl font-bold">{boss.title}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{chapterTitle}</p>
          <p className="mt-4 text-[var(--muted)]">{boss.description}</p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="chip">
              <Swords className="size-3" /> {boss.questions.length} questions
            </span>
            <span className="chip chip-warning">
              <Clock className="size-3" /> {boss.timeLimitSeconds}s
            </span>
            <span className="chip chip-accent">+{boss.xp} XP</span>
          </div>
          <button
            className="btn btn-primary mt-6"
            onClick={() => setStarted(true)}
          >
            <Swords className="size-4" /> Commencer le combat
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((correct / boss.questions.length) * 100);
    const perfect = pct === 100 && timeLeft > 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-2xl panel-solid p-10 text-center"
      >
        <div className="text-6xl">{perfect ? "🏆" : pct >= 70 ? "🎉" : "💪"}</div>
        <h1 className="mt-3 text-3xl font-bold">
          {perfect ? "Victoire parfaite !" : pct >= 70 ? "Boss vaincu !" : "Pas encore..."}
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          {correct} / {boss.questions.length} bonnes réponses ({pct}%)
        </p>
        <div className="mt-4">
          <span className="chip chip-accent">
            <Trophy className="size-3" />
            +{perfect ? boss.xp : Math.round(boss.xp * (correct / boss.questions.length))} XP
          </span>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/defis" className="btn btn-ghost">
            Autres défis
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => {
              setIdx(0);
              setCorrect(0);
              setTimeLeft(boss.timeLimitSeconds);
              setStarted(false);
              setFinished(false);
            }}
          >
            Recommencer
          </button>
        </div>
      </motion.div>
    );
  }

  const q = boss.questions[idx];
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-[var(--muted)]">
          Question {idx + 1} / {boss.questions.length}
        </div>
        <div
          className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-lg font-bold ${
            timeLeft <= 10 ? "border-rose-500/50 bg-rose-500/10 text-rose-300 pulse-ring" : "border-[var(--border)]"
          }`}
        >
          <Clock className="size-4" /> {timeLeft}s
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[var(--card)]">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all"
          style={{ width: `${((idx + 1) / boss.questions.length) * 100}%` }}
        />
      </div>

      <ExerciseRunner
        key={q.id}
        exercise={q}
        onSolved={handleSolved}
        autoAward={false}
      />
    </div>
  );
}
