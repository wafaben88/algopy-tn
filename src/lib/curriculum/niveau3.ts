import type { Chapter } from "./types";

export const niveau3Chapters: Chapter[] = [
  {
    id: "n3-c1",
    levelId: "niveau3",
    title: "Algorithmes de tri",
    description:
      "Tri par sélection, tri à bulles, tri par insertion — les classiques du Bac.",
    emoji: "📈",
    lessons: [
      {
        id: "n3-c1-l1",
        chapterId: "n3-c1",
        title: "Tri par sélection",
        objective:
          "Trier une liste en sélectionnant le minimum à chaque étape.",
        xp: 40,
        estimatedMinutes: 15,
        sections: [
          {
            type: "text",
            markdown:
              "Le **tri par sélection** cherche le plus petit élément et le place en première position, puis recommence sur le sous-tableau restant. Complexité : O(n²).",
          },
          {
            type: "code",
            pseudo:
              "Procédure tri_selection(T)\n  Pour i de 0 à n-2 Faire\n    imin ← i\n    Pour j de i+1 à n-1 Faire\n      Si T[j] < T[imin] Alors imin ← j\n    Fin Pour\n    Échanger T[i] et T[imin]\n  Fin Pour",
            python:
              "def tri_selection(T):\n    n = len(T)\n    for i in range(n - 1):\n        imin = i\n        for j in range(i + 1, n):\n            if T[j] < T[imin]:\n                imin = j\n        T[i], T[imin] = T[imin], T[i]\n    return T",
          },
        ],
        exercises: [
          {
            id: "n3-c1-l1-e1",
            type: "code",
            prompt:
              "Implémente `tri_bulles(T)` (bubble sort) qui trie T en place et le renvoie.",
            starter: "def tri_bulles(T):\n    pass\n\nprint(tri_bulles([5,2,9,1,7]))\n",
            solution:
              "def tri_bulles(T):\n    n = len(T)\n    for i in range(n - 1):\n        for j in range(n - 1 - i):\n            if T[j] > T[j+1]:\n                T[j], T[j+1] = T[j+1], T[j]\n    return T",
            tests: [
              {
                description: "Tri correct",
                assertion: "tri_bulles([5,2,9,1,7]) == [1,2,5,7,9]",
              },
              {
                description: "Liste vide",
                assertion: "tri_bulles([]) == []",
              },
            ],
            hints: [
              "Compare chaque paire adjacente et échange-les si elles sont dans le mauvais ordre.",
              "Répète tant qu'il y a au moins un échange.",
            ],
            xp: 40,
            difficulty: "difficile",
          },
        ],
      },
    ],
  },

  {
    id: "n3-c2",
    levelId: "niveau3",
    title: "Recherche dichotomique",
    description: "La recherche en O(log n) dans un tableau trié.",
    emoji: "🎯",
    lessons: [
      {
        id: "n3-c2-l1",
        chapterId: "n3-c2",
        title: "Principe de la dichotomie",
        objective:
          "Comprendre et implémenter la recherche dichotomique.",
        xp: 40,
        estimatedMinutes: 15,
        sections: [
          {
            type: "text",
            markdown:
              "Dans un tableau **trié**, on peut rechercher un élément en **O(log n)** : on compare à l'élément central, puis on élimine la moitié qui ne peut pas contenir la valeur.",
          },
          {
            type: "code",
            pseudo:
              "Fonction dicho(T, v) : entier\n  g ← 0 ; d ← n - 1\n  Tant que g ≤ d Faire\n    m ← (g + d) DIV 2\n    Si T[m] = v Alors retourner m\n    Si T[m] < v Alors g ← m+1 Sinon d ← m-1\n  Fin TantQue\n  retourner -1",
            python:
              "def dicho(T, v):\n    g, d = 0, len(T) - 1\n    while g <= d:\n        m = (g + d) // 2\n        if T[m] == v: return m\n        if T[m] < v: g = m + 1\n        else: d = m - 1\n    return -1",
          },
        ],
        exercises: [
          {
            id: "n3-c2-l1-e1",
            type: "code",
            prompt:
              "Implémente `dicho(T, v)` qui renvoie l'indice de v dans T trié, ou -1.",
            starter: "def dicho(T, v):\n    pass\n\nprint(dicho([1,3,5,7,9,11], 7))\n",
            solution:
              "def dicho(T, v):\n    g, d = 0, len(T) - 1\n    while g <= d:\n        m = (g + d) // 2\n        if T[m] == v: return m\n        if T[m] < v: g = m + 1\n        else: d = m - 1\n    return -1",
            tests: [
              { description: "Trouve 7 à 3", assertion: "dicho([1,3,5,7,9,11], 7) == 3" },
              { description: "Absent", assertion: "dicho([1,3,5,7], 4) == -1" },
            ],
            xp: 45,
            difficulty: "difficile",
          },
        ],
      },
    ],
    boss: {
      id: "n3-c2-boss",
      title: "Boss Final : Le Gardien du Bac",
      description:
        "Seul un algorithmicien accompli peut le vaincre. Bonne chance !",
      xp: 120,
      timeLimitSeconds: 300,
      questions: [
        {
          id: "n3-c2-boss-q1",
          type: "mcq",
          prompt: "Complexité du tri par sélection ?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correctIndex: 3,
          xp: 20,
          difficulty: "moyen",
        },
        {
          id: "n3-c2-boss-q2",
          type: "mcq",
          prompt:
            "Dans une recherche dichotomique sur 1024 éléments, combien de comparaisons au pire ?",
          options: ["10", "32", "512", "1024"],
          correctIndex: 0,
          xp: 25,
          difficulty: "difficile",
          explanation: "log₂(1024) = 10.",
        },
        {
          id: "n3-c2-boss-q3",
          type: "code",
          prompt:
            "Écris `fibo(n)` qui renvoie le n-ième nombre de Fibonacci (fibo(0)=0, fibo(1)=1).",
          starter: "def fibo(n):\n    pass\n\nprint(fibo(10))\n",
          solution:
            "def fibo(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a",
          tests: [
            { description: "fibo(0)=0", assertion: "fibo(0) == 0" },
            { description: "fibo(1)=1", assertion: "fibo(1) == 1" },
            { description: "fibo(10)=55", assertion: "fibo(10) == 55" },
          ],
          xp: 40,
          difficulty: "difficile",
        },
      ],
    },
  },
];
