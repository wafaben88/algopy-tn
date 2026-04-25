export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  check: (ctx: BadgeContext) => boolean;
}

export interface BadgeContext {
  totalXp: number;
  completedLessons: string[];
  completedExercises: string[];
  completedBosses: string[];
  streakDays: number;
  perfectQuizzes: number;
  pythonRuns: number;
  challengesWon: number;
}

export const BADGES: BadgeDef[] = [
  {
    id: "first-step",
    title: "Premier pas",
    description: "Termine ta première leçon.",
    emoji: "🐣",
    check: (c) => c.completedLessons.length >= 1,
  },
  {
    id: "hello-world",
    title: "Hello, Tunisia!",
    description: "Exécute ton premier programme Python.",
    emoji: "🐍",
    check: (c) => c.pythonRuns >= 1,
  },
  {
    id: "three-in-row",
    title: "En feu",
    description: "Garde un streak de 3 jours.",
    emoji: "🔥",
    check: (c) => c.streakDays >= 3,
  },
  {
    id: "week-streak",
    title: "Une semaine complète",
    description: "Garde un streak de 7 jours.",
    emoji: "⚡",
    check: (c) => c.streakDays >= 7,
  },
  {
    id: "perfect-quiz",
    title: "Sans faute",
    description: "Réussis un quiz sans aucune erreur.",
    emoji: "🎯",
    check: (c) => c.perfectQuizzes >= 1,
  },
  {
    id: "ten-exercises",
    title: "Dix sur dix",
    description: "Complète 10 exercices.",
    emoji: "💪",
    check: (c) => c.completedExercises.length >= 10,
  },
  {
    id: "boss-slayer",
    title: "Tombeur de boss",
    description: "Bats ton premier boss de chapitre.",
    emoji: "👑",
    check: (c) => c.completedBosses.length >= 1,
  },
  {
    id: "xp-500",
    title: "500 XP",
    description: "Atteins 500 XP au total.",
    emoji: "🥈",
    check: (c) => c.totalXp >= 500,
  },
  {
    id: "xp-1500",
    title: "1500 XP",
    description: "Atteins 1500 XP au total.",
    emoji: "🥇",
    check: (c) => c.totalXp >= 1500,
  },
  {
    id: "challenger",
    title: "Challenger",
    description: "Remporte 5 défis chronométrés.",
    emoji: "⏱️",
    check: (c) => c.challengesWon >= 5,
  },
  {
    id: "algo-master",
    title: "Maître de l'algo",
    description: "Termine un niveau complet.",
    emoji: "🏆",
    check: (c) => c.completedLessons.length >= 8,
  },
  {
    id: "tunisian-coder",
    title: "Coder tunisien 🇹🇳",
    description: "Atteins le niveau 5.",
    emoji: "🇹🇳",
    check: (c) => c.totalXp >= 1200,
  },
];
