"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Dumbbell,
  Swords,
  Trophy,
  User,
  Flame,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/cours", label: "Cours", icon: BookOpen },
  { href: "/exercices", label: "Exercices", icon: Dumbbell },
  { href: "/defis", label: "Défis", icon: Swords },
  { href: "/classement", label: "Classement", icon: Trophy },
  { href: "/profil", label: "Profil", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-xl md:flex">
      <div className="px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-3xl">🐍</span>
          <div className="leading-tight">
            <div className="text-lg font-bold gradient-text">AlgoPy TN</div>
            <div className="text-xs text-[var(--muted)]">Apprends, joue, gagne 🇹🇳</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-gradient-to-r from-[var(--primary)]/20 to-transparent text-white"
                  : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "size-5 transition-colors",
                  active
                    ? "text-[var(--primary-glow)]"
                    : "text-[var(--muted)] group-hover:text-white",
                )}
              />
              <span>{label}</span>
              {active && (
                <span className="ml-auto size-1.5 rounded-full bg-[var(--primary-glow)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-6 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-[var(--primary-glow)]" />
          Astuce du jour
        </div>
        <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
          Complète une leçon chaque jour pour garder ton{" "}
          <span className="inline-flex items-center gap-1 text-orange-400">
            <Flame className="size-3" /> streak
          </span>
          .
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5">
        {NAV.filter((n) => n.href !== "/classement").map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-xs",
                active ? "text-[var(--primary-glow)]" : "text-[var(--muted)]",
              )}
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
