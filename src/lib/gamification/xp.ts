export const LEVEL_TITLES = [
  "Lycéen curieux",
  "Apprenti algorithmicien",
  "Codeur en herbe",
  "Développeur débutant",
  "Pythoniste confirmé",
  "Maître de l'algorithme",
  "Champion du Bac Info",
  "Légende tunisienne du code",
];

/** XP required to go from level n to level n+1 grows gently. */
export function xpForLevel(level: number): number {
  return 100 + level * 50;
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 0; i < level; i++) total += xpForLevel(i);
  return total;
}

export function levelFromXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
  title: string;
} {
  let level = 0;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  const next = xpForLevel(level);
  return {
    level,
    currentLevelXp: remaining,
    nextLevelXp: next,
    progress: next === 0 ? 0 : remaining / next,
    title: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)],
  };
}
