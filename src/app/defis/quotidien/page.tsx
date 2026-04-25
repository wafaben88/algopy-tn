"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowLeft } from "lucide-react";
import { getDailyChallenge } from "@/lib/curriculum";
import { ExerciseRunner } from "@/components/exercise/ExerciseRunner";
import { useProgressStore } from "@/lib/store/useProgressStore";

export default function DailyChallengePage() {
  const exercise = useMemo(() => getDailyChallenge(), []);
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(true);
  const [solved, setSolved] = useState(false);
  const recordChallengeWin = useProgressStore((s) => s.recordChallengeWin);

  useEffect(() => {
    if (!running || solved) return;
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          setRunning(false);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, solved]);

  const handleSolved = () => {
    setSolved(true);
    setRunning(false);
    recordChallengeWin();
  };

  if (!exercise) {
    return (
      <div className="mx-auto max-w-2xl panel-solid p-10 text-center">
        Pas de défi disponible aujourd&apos;hui.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/defis" className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-white">
        <ArrowLeft className="size-4" /> Retour aux défis
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel-solid p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Défi du jour ⚔️</h1>
          <div
            className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-lg font-bold ${
              timeLeft <= 10
                ? "border-rose-500/50 bg-rose-500/10 text-rose-300"
                : "border-[var(--border)] bg-[var(--card)]"
            }`}
          >
            <Clock className="size-4" />
            {Math.max(0, timeLeft)}s
          </div>
        </div>

        {!running && !solved && timeLeft <= 0 && (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
            ⏰ Temps écoulé ! Tu peux tout de même répondre pour t&apos;entraîner, mais sans XP bonus.
          </div>
        )}
        {solved && (
          <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-200">
            🎉 Bravo, tu as relevé le défi ! Reviens demain pour un nouveau.
          </div>
        )}

        <ExerciseRunner exercise={exercise} onSolved={handleSolved} />
      </motion.div>
    </div>
  );
}
