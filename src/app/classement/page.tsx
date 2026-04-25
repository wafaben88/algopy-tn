"use client";

import { useMemo } from "react";
import { Trophy, Crown, Medal } from "lucide-react";
import { useProgressStore } from "@/lib/store/useProgressStore";
import { levelFromXp } from "@/lib/gamification/xp";

interface LeaderEntry {
  name: string;
  avatar: string;
  xp: number;
  isYou?: boolean;
}

const BOTS: LeaderEntry[] = [
  { name: "Yasmine (Sousse)", avatar: "🧕", xp: 2430 },
  { name: "Oussama (Tunis)", avatar: "🧑‍💻", xp: 2180 },
  { name: "Amira (Sfax)", avatar: "🦊", xp: 1890 },
  { name: "Ahmed (Monastir)", avatar: "🦅", xp: 1540 },
  { name: "Salma (Bizerte)", avatar: "🐼", xp: 1320 },
  { name: "Mehdi (Kairouan)", avatar: "🐯", xp: 980 },
  { name: "Nour (Gabès)", avatar: "🦉", xp: 740 },
  { name: "Wassim (Nabeul)", avatar: "🐙", xp: 520 },
  { name: "Ines (Béja)", avatar: "🦄", xp: 310 },
];

export default function LeaderboardPage() {
  const { username, avatar, totalXp } = useProgressStore();

  const board = useMemo(() => {
    const entries: LeaderEntry[] = [
      ...BOTS,
      { name: `${username} (toi)`, avatar, xp: totalXp, isYou: true },
    ];
    return entries
      .sort((a, b) => b.xp - a.xp)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  }, [username, avatar, totalXp]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Classement</span> de la semaine 🏆
        </h1>
        <p className="text-[var(--muted)]">
          Compare-toi à d&apos;autres élèves (simulé en local pour l&apos;instant).
          Gagne plus d&apos;XP pour monter !
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {board.slice(0, 3).map((p) => (
          <div
            key={p.name}
            className="panel-solid p-4 text-center relative overflow-hidden"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
                p.rank === 1
                  ? "from-amber-400 to-yellow-500"
                  : p.rank === 2
                    ? "from-slate-300 to-slate-500"
                    : "from-orange-400 to-amber-700"
              }`}
            />
            <div className="mt-2 flex justify-center">
              {p.rank === 1 ? (
                <Crown className="size-6 text-amber-400" />
              ) : (
                <Medal
                  className={`size-6 ${p.rank === 2 ? "text-slate-300" : "text-orange-500"}`}
                />
              )}
            </div>
            <div className="mt-1 text-4xl">{p.avatar}</div>
            <div className="mt-2 font-bold truncate">{p.name}</div>
            <div className="mt-1 text-sm text-[var(--muted)]">
              {p.xp} XP · {levelFromXp(p.xp).title}
            </div>
          </div>
        ))}
      </div>

      <ol className="panel-solid divide-y divide-[var(--border)] overflow-hidden">
        {board.map((p) => (
          <li
            key={p.name}
            className={`flex items-center gap-3 px-4 py-3 ${
              p.isYou ? "bg-[var(--primary)]/10" : ""
            }`}
          >
            <span
              className={`grid size-8 place-items-center rounded-full text-sm font-bold ${
                p.rank <= 3
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-[var(--card)] text-[var(--muted)]"
              }`}
            >
              {p.rank}
            </span>
            <span className="text-2xl">{p.avatar}</span>
            <span className="flex-1 truncate font-medium">
              {p.name}
              {p.isYou && <span className="ml-2 chip chip-accent">toi</span>}
            </span>
            <span className="text-sm text-[var(--muted)]">
              {levelFromXp(p.xp).title}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-sm font-semibold">
              <Trophy className="size-3.5 text-amber-400" /> {p.xp}
            </span>
          </li>
        ))}
      </ol>

      <p className="text-center text-xs text-[var(--muted)]">
        Astuce : une future version pourrait synchroniser le classement entre
        lycées via un backend.
      </p>
    </div>
  );
}
