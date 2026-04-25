"use client";

import { Heart, Flame, Zap } from "lucide-react";
import { useEffect } from "react";
import { useProgressStore } from "@/lib/store/useProgressStore";
import { levelFromXp } from "@/lib/gamification/xp";
import Link from "next/link";

export function Header() {
  const {
    hearts,
    maxHearts,
    streakDays,
    totalXp,
    username,
    avatar,
    tickHearts,
  } = useProgressStore();

  useEffect(() => {
    const t = setInterval(() => tickHearts(), 30000);
    return () => clearInterval(t);
  }, [tickHearts]);

  const { level, currentLevelXp, nextLevelXp, progress, title } =
    levelFromXp(totalXp);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
        <div className="md:hidden flex items-center gap-2">
          <span className="text-2xl">🐍</span>
          <span className="font-bold gradient-text">AlgoPy TN</span>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="text-sm text-[var(--muted)]">
            Niveau <span className="text-[var(--foreground)] font-semibold">{level}</span>
          </div>
          <div className="h-2.5 w-48 overflow-hidden rounded-full bg-[var(--card)] border border-[var(--border)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-glow)] transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="text-xs text-[var(--muted)]">
            {currentLevelXp}/{nextLevelXp} XP
          </div>
          <span className="chip chip-accent hidden lg:inline-flex">{title}</span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-sm">
            <Flame className="size-4 text-orange-400" />
            <span className="font-semibold text-orange-300">{streakDays}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-sm">
            <Heart
              className={`size-4 ${hearts > 0 ? "text-rose-400 fill-rose-400" : "text-rose-900"}`}
            />
            <span className="font-semibold text-rose-300">
              {hearts}/{maxHearts}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm">
            <Zap className="size-4 text-amber-400" />
            <span className="font-semibold text-amber-300">{totalXp}</span>
          </div>
          <Link
            href="/profil"
            className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-1 transition-colors hover:bg-[var(--card-hover)]"
          >
            <span className="text-xl">{avatar}</span>
            <span className="hidden sm:inline text-sm font-medium pr-1">
              {username}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
