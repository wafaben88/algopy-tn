import type { Chapter } from "./types";

export const niveau2Chapters: Chapter[] = [
  {
    id: "n2-c1",
    levelId: "niveau2",
    title: "Les tableaux (listes)",
    description:
      "Stocker une collection de valeurs indexées et les manipuler.",
    emoji: "📊",
    lessons: [
      {
        id: "n2-c1-l1",
        chapterId: "n2-c1",
        title: "Déclarer et parcourir un tableau",
        objective:
          "Créer des listes, y accéder par indice, les parcourir.",
        xp: 30,
        estimatedMinutes: 12,
        sections: [
          {
            type: "text",
            markdown:
              "Un **tableau** (ou **liste** en Python) regroupe plusieurs valeurs du même type accessibles par leur **indice**. L'indice commence à **0** en Python.",
          },
          {
            type: "code",
            pseudo:
              "TDO : notes : tableau de 5 réels\nDébut\n  notes ← [12, 15, 9, 18, 11]\n  Écrire(notes[0])  { 12 }\n  Écrire(notes[4])  { 11 }\nFin",
            python:
              'notes = [12, 15, 9, 18, 11]\nprint(notes[0])   # 12\nprint(notes[4])   # 11\nprint(notes[-1])  # 11 (dernier)',
          },
          {
            type: "concept",
            title: "Parcourir un tableau",
            markdown:
              "Deux manières classiques :\n\n```python\n# par indice\nfor i in range(len(notes)):\n    print(notes[i])\n\n# par valeur\nfor n in notes:\n    print(n)\n```",
          },
          {
            type: "tip",
            markdown:
              "`len(liste)` donne la taille. `liste.append(x)` ajoute un élément à la fin.",
          },
        ],
        exercises: [
          {
            id: "n2-c1-l1-e1",
            type: "code",
            prompt:
              "Calcule la moyenne des notes de la liste `notes` dans `moyenne`.",
            starter: "notes = [12, 15, 9, 18, 11]\n# à toi\n\nprint(moyenne)\n",
            solution:
              "notes = [12, 15, 9, 18, 11]\nmoyenne = sum(notes) / len(notes)\nprint(moyenne)",
            tests: [{ description: "Moyenne", assertion: "abs(moyenne - 13) < 0.01" }],
            xp: 25,
            difficulty: "moyen",
          },
          {
            id: "n2-c1-l1-e2",
            type: "code",
            prompt:
              "Trouve le maximum de la liste `tab` sans utiliser `max()`. Stocke-le dans `maxi`.",
            starter: "tab = [3, 9, 1, 14, 7, 22, 5]\n# à toi\n\nprint(maxi)\n",
            solution:
              "tab = [3, 9, 1, 14, 7, 22, 5]\nmaxi = tab[0]\nfor x in tab[1:]:\n    if x > maxi:\n        maxi = x\nprint(maxi)",
            tests: [{ description: "Max = 22", assertion: "maxi == 22" }],
            xp: 30,
            difficulty: "moyen",
          },
        ],
      },
      {
        id: "n2-c1-l2",
        chapterId: "n2-c1",
        title: "Recherche séquentielle",
        objective:
          "Rechercher un élément dans une liste non triée.",
        xp: 30,
        estimatedMinutes: 12,
        sections: [
          {
            type: "text",
            markdown:
              "La **recherche séquentielle** consiste à parcourir la liste élément par élément jusqu'à trouver la valeur cherchée (ou à la fin).",
          },
          {
            type: "code",
            pseudo:
              "Fonction recherche(T, v) :\n  Pour i de 0 à longueur(T)-1 Faire\n    Si T[i] = v Alors retourner i\n  Fin Pour\n  retourner -1",
            python:
              "def recherche(T, v):\n    for i in range(len(T)):\n        if T[i] == v:\n            return i\n    return -1",
          },
          {
            type: "concept",
            title: "Complexité",
            markdown:
              "Dans le pire des cas on parcourt toute la liste → **O(n)**. C'est simple mais lent pour de grandes listes.",
          },
        ],
        exercises: [
          {
            id: "n2-c1-l2-e1",
            type: "code",
            prompt:
              "Écris la fonction `position(tab, v)` qui renvoie l'indice de la 1ère occurrence de v, ou -1 si absente.",
            starter: 'def position(tab, v):\n    pass\n\nprint(position([1,2,3,4], 3))\n',
            solution:
              "def position(tab, v):\n    for i in range(len(tab)):\n        if tab[i] == v:\n            return i\n    return -1",
            tests: [
              { description: "Trouve 3 à l'indice 2", assertion: "position([1,2,3,4], 3) == 2" },
              { description: "Non trouvé → -1", assertion: "position([1,2,3], 9) == -1" },
            ],
            xp: 30,
            difficulty: "moyen",
          },
        ],
      },
    ],
    boss: {
      id: "n2-c1-boss",
      title: "Boss : Le Tableau Magique",
      description: "Ses cases cachent des secrets...",
      xp: 70,
      timeLimitSeconds: 180,
      questions: [
        {
          id: "n2-c1-boss-q1",
          type: "mcq",
          prompt: "Quel est l'indice du dernier élément de la liste [4, 8, 2, 9] ?",
          options: ["0", "3", "4", "9"],
          correctIndex: 1,
          xp: 15,
          difficulty: "facile",
        },
        {
          id: "n2-c1-boss-q2",
          type: "code",
          prompt:
            "Compte le nombre d'occurrences de `v` dans `tab`. Stocke dans `nb`.",
          starter: "tab = [1, 3, 2, 3, 4, 3, 5]\nv = 3\n# à toi\n\nprint(nb)\n",
          solution:
            "tab = [1, 3, 2, 3, 4, 3, 5]\nv = 3\nnb = 0\nfor x in tab:\n    if x == v:\n        nb += 1\nprint(nb)",
          tests: [{ description: "nb=3", assertion: "nb == 3" }],
          xp: 25,
          difficulty: "moyen",
        },
      ],
    },
  },

  {
    id: "n2-c2",
    levelId: "niveau2",
    title: "Fonctions et procédures",
    description: "Découper un problème en sous-programmes réutilisables.",
    emoji: "🧩",
    lessons: [
      {
        id: "n2-c2-l1",
        chapterId: "n2-c2",
        title: "Définir une fonction",
        objective:
          "Écrire des fonctions avec paramètres et valeur de retour.",
        xp: 30,
        estimatedMinutes: 12,
        sections: [
          {
            type: "text",
            markdown:
              "Une **fonction** est un bloc d'instructions qu'on écrit une fois et qu'on réutilise autant de fois qu'on veut. Elle prend des **paramètres** et renvoie une **valeur**.",
          },
          {
            type: "code",
            pseudo:
              "Fonction carre(x : réel) : réel\nDébut\n  retourner x * x\nFin",
            python:
              "def carre(x):\n    return x * x\n\nprint(carre(5))  # 25",
          },
          {
            type: "concept",
            title: "Fonction vs procédure",
            markdown:
              "- Une **fonction** renvoie une valeur (`return ...`).\n- Une **procédure** n'en renvoie pas : elle fait juste une action (afficher par exemple).",
          },
        ],
        exercises: [
          {
            id: "n2-c2-l1-e1",
            type: "code",
            prompt:
              "Écris la fonction `somme_n(n)` qui renvoie 1 + 2 + ... + n.",
            starter: "def somme_n(n):\n    pass\n\nprint(somme_n(10))\n",
            solution:
              "def somme_n(n):\n    s = 0\n    for i in range(1, n+1):\n        s += i\n    return s",
            tests: [
              { description: "somme_n(10) = 55", assertion: "somme_n(10) == 55" },
              { description: "somme_n(100) = 5050", assertion: "somme_n(100) == 5050" },
            ],
            xp: 30,
            difficulty: "moyen",
          },
          {
            id: "n2-c2-l1-e2",
            type: "code",
            prompt:
              "Écris `est_pair(n)` qui renvoie True si n est pair, False sinon.",
            starter: "def est_pair(n):\n    pass\n\nprint(est_pair(4))\n",
            solution: "def est_pair(n):\n    return n % 2 == 0",
            tests: [
              { description: "est_pair(4) True", assertion: "est_pair(4) == True" },
              { description: "est_pair(7) False", assertion: "est_pair(7) == False" },
            ],
            xp: 20,
            difficulty: "facile",
          },
        ],
      },
    ],
  },

  {
    id: "n2-c3",
    levelId: "niveau2",
    title: "Chaînes de caractères",
    description: "Manipuler du texte : longueur, concaténation, indexation.",
    emoji: "🔤",
    lessons: [
      {
        id: "n2-c3-l1",
        chapterId: "n2-c3",
        title: "Opérations sur les chaînes",
        objective: "len, indexation, slicing, in, concaténation.",
        xp: 30,
        estimatedMinutes: 12,
        sections: [
          {
            type: "code",
            pseudo:
              "s ← \"Tunisie\"\nÉcrire(long(s))  { 7 }\nÉcrire(s[0])    { 'T' }\nÉcrire(sous_chaîne(s, 0, 3))  { 'Tun' }",
            python:
              's = "Tunisie"\nprint(len(s))   # 7\nprint(s[0])     # T\nprint(s[0:3])   # Tun\nprint("Tun" in s)  # True',
          },
          {
            type: "tip",
            markdown:
              "- `s.upper()` → majuscules, `s.lower()` → minuscules\n- `s.replace(\"a\",\"b\")` remplace\n- `s.split(\",\")` découpe en liste",
          },
        ],
        exercises: [
          {
            id: "n2-c3-l1-e1",
            type: "code",
            prompt:
              "Écris `est_palindrome(s)` qui renvoie True si s se lit pareil à l'endroit et à l'envers.",
            starter: "def est_palindrome(s):\n    pass\n\nprint(est_palindrome(\"radar\"))\n",
            solution:
              "def est_palindrome(s):\n    return s == s[::-1]",
            tests: [
              { description: "radar ok", assertion: 'est_palindrome("radar") == True' },
              { description: "python non", assertion: 'est_palindrome("python") == False' },
            ],
            hints: ["s[::-1] inverse une chaîne en Python."],
            xp: 30,
            difficulty: "moyen",
          },
        ],
      },
    ],
  },
];
