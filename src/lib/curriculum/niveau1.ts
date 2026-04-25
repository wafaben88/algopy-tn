import type { Chapter } from "./types";

export const niveau1Chapters: Chapter[] = [
  // ============================================================
  // Chapitre 1 — Introduction à l'algorithmique
  // ============================================================
  {
    id: "n1-c1",
    levelId: "niveau1",
    title: "Introduction à l'algorithmique",
    description:
      "Qu'est-ce qu'un algorithme ? Premier pas vers la pensée informatique.",
    emoji: "🧭",
    lessons: [
      {
        id: "n1-c1-l1",
        chapterId: "n1-c1",
        title: "Qu'est-ce qu'un algorithme ?",
        objective:
          "Comprendre ce qu'est un algorithme et reconnaître ses étapes.",
        xp: 20,
        estimatedMinutes: 7,
        sections: [
          {
            type: "text",
            markdown:
              "Un **algorithme** est une suite finie et ordonnée d'instructions qui permet de résoudre un problème. Tu en utilises déjà tous les jours sans le savoir : préparer un thé à la menthe, aller de chez toi au lycée, ou encore lacer tes chaussures !",
          },
          {
            type: "concept",
            title: "Les 3 caractéristiques d'un algorithme",
            markdown:
              "- **Fini** : il se termine après un nombre limité d'étapes.\n- **Ordonné** : les étapes se suivent dans un ordre précis.\n- **Précis** : chaque étape est claire et sans ambiguïté.",
          },
          {
            type: "example",
            markdown:
              "**Algorithme : Faire un thé tunisien**\n1. Remplir la *berrad* (théière) d'eau.\n2. Ajouter du thé vert et du sucre.\n3. Porter à ébullition.\n4. Ajouter des feuilles de menthe.\n5. Verser dans un verre de haut en bas (3 fois).",
          },
          {
            type: "tip",
            markdown:
              "En informatique, l'ordinateur exécute l'algorithme à ta place. Mais pour qu'il comprenne, il faut être très précis !",
          },
        ],
        exercises: [
          {
            id: "n1-c1-l1-e1",
            type: "mcq",
            prompt: "Laquelle de ces définitions correspond à un algorithme ?",
            options: [
              "Un langage de programmation comme Python.",
              "Une suite finie et ordonnée d'instructions qui résout un problème.",
              "Un ordinateur très rapide.",
              "Un réseau social pour informaticiens.",
            ],
            correctIndex: 1,
            xp: 10,
            difficulty: "facile",
            explanation:
              "Un algorithme est indépendant du langage : il décrit la solution, pas comment on l'écrit.",
          },
          {
            id: "n1-c1-l1-e2",
            type: "mcq",
            prompt: "Quelle caractéristique N'EST PAS obligatoire pour un algorithme ?",
            options: ["Fini", "Ordonné", "Écrit en Python", "Précis"],
            correctIndex: 2,
            xp: 10,
            difficulty: "facile",
            explanation:
              "L'algorithme est indépendant du langage. Python n'est qu'un moyen parmi d'autres de l'exécuter.",
          },
          {
            id: "n1-c1-l1-e3",
            type: "order",
            prompt:
              "Remets dans l'ordre les étapes de l'algorithme « Préparer un café » :",
            items: [
              "Servir dans la tasse",
              "Mettre la poudre de café dans la cafetière",
              "Ajouter de l'eau",
              "Mettre sur le feu",
            ],
            correctOrder: [1, 2, 3, 0],
            xp: 15,
            difficulty: "facile",
          },
        ],
      },
      {
        id: "n1-c1-l2",
        chapterId: "n1-c1",
        title: "Pseudo-code et Python",
        objective:
          "Découvrir le pseudo-code tunisien et faire le lien avec Python.",
        xp: 25,
        estimatedMinutes: 10,
        sections: [
          {
            type: "text",
            markdown:
              "En Tunisie, au lycée, on écrit les algorithmes en **pseudo-code** (une forme standardisée de français). Ensuite, on les traduit dans un **langage de programmation** comme Python pour les exécuter sur un ordinateur.",
          },
          {
            type: "code",
            pseudo:
              "Algorithme Bonjour\nDébut\n  Écrire(\"Bonjour le monde !\")\nFin",
            python: 'print("Bonjour le monde !")',
            explanation:
              "À gauche : le pseudo-code officiel tunisien. À droite : sa traduction en Python.",
          },
          {
            type: "concept",
            title: "Structure d'un algorithme",
            markdown:
              "Un algorithme tunisien typique suit cette structure :\n\n- `Algorithme nom_algo` — nom de l'algorithme\n- `Début` — ouverture\n- *instructions...*\n- `Fin` — fermeture\n\nEn Python, il n'y a pas de `Début` / `Fin` — l'indentation fait le travail.",
          },
          {
            type: "code",
            pseudo:
              "Algorithme Salutation\nDébut\n  Écrire(\"Ahla bik !\")\n  Écrire(\"Bienvenue en 2ème info.\")\nFin",
            python:
              'print("Ahla bik !")\nprint("Bienvenue en 2ème info.")',
          },
          {
            type: "tip",
            markdown:
              "`Écrire` en pseudo-code ⟷ `print` en Python. `Lire` ⟷ `input`.",
          },
        ],
        exercises: [
          {
            id: "n1-c1-l2-e1",
            type: "mcq",
            prompt: "En Python, quelle instruction affiche du texte à l'écran ?",
            options: ["Écrire()", "print()", "display()", "say()"],
            correctIndex: 1,
            xp: 10,
            difficulty: "facile",
          },
          {
            id: "n1-c1-l2-e2",
            type: "code",
            prompt:
              "Écris un programme Python qui affiche `Salut, Tunisie !` à l'écran.",
            starter: '# Complète ici\n',
            solution: 'print("Salut, Tunisie !")',
            tests: [
              {
                description: "Affiche le bon message",
                assertion:
                  '"Salut, Tunisie !" in _stdout or "Salut, Tunisie!" in _stdout',
              },
            ],
            hints: ["Utilise la fonction print() avec le message entre guillemets."],
            xp: 20,
            difficulty: "facile",
          },
        ],
      },
    ],
    boss: {
      id: "n1-c1-boss",
      title: "Boss : L'esprit algorithmique",
      description: "Prouve que tu as compris les bases de l'algorithmique !",
      xp: 50,
      timeLimitSeconds: 120,
      questions: [
        {
          id: "n1-c1-boss-q1",
          type: "mcq",
          prompt: "Un algorithme doit toujours être...",
          options: [
            "Infini",
            "Écrit en arabe",
            "Fini, ordonné et précis",
            "Écrit par un professeur",
          ],
          correctIndex: 2,
          xp: 15,
          difficulty: "moyen",
        },
        {
          id: "n1-c1-boss-q2",
          type: "mcq",
          prompt: "Quelle correspondance est correcte ?",
          options: [
            "Écrire → input",
            "Lire → print",
            "Écrire → print",
            "Fin → end",
          ],
          correctIndex: 2,
          xp: 15,
          difficulty: "moyen",
        },
        {
          id: "n1-c1-boss-q3",
          type: "fill",
          prompt: "Complète l'instruction Python pour afficher « Bac Info 2025 » :",
          template: "____(\"Bac Info 2025\")",
          answers: ["print"],
          xp: 20,
          difficulty: "moyen",
        },
      ],
    },
  },

  // ============================================================
  // Chapitre 2 — Variables et types de données
  // ============================================================
  {
    id: "n1-c2",
    levelId: "niveau1",
    title: "Variables & types de données",
    description:
      "Stocker, typer et manipuler des données : entiers, réels, chaînes, booléens.",
    emoji: "📦",
    lessons: [
      {
        id: "n1-c2-l1",
        chapterId: "n1-c2",
        title: "Les variables",
        objective:
          "Déclarer une variable et comprendre l'affectation.",
        xp: 25,
        estimatedMinutes: 10,
        sections: [
          {
            type: "text",
            markdown:
              "Une **variable** est une case mémoire à laquelle on donne un **nom** et une **valeur**. On peut imaginer une variable comme une boîte avec une étiquette.",
          },
          {
            type: "code",
            pseudo:
              "Algorithme AgeEleve\nTDO :\n  age : entier\nDébut\n  age ← 17\n  Écrire(\"J'ai \", age, \" ans.\")\nFin",
            python:
              'age = 17\nprint("J\'ai", age, "ans.")',
            explanation:
              "En pseudo-code tunisien, `←` est l'affectation. En Python, c'est `=`.",
          },
          {
            type: "concept",
            title: "Règles de nommage",
            markdown:
              "- Un nom de variable commence par une lettre ou `_`.\n- Il peut contenir des lettres, chiffres et `_`.\n- Il ne doit **pas** contenir d'espaces ni de caractères spéciaux.\n- Python distingue majuscules et minuscules : `age` ≠ `Age`.",
          },
          {
            type: "warning",
            markdown:
              "Évite les mots réservés de Python comme `print`, `if`, `for`, `class`... comme noms de variables.",
          },
        ],
        exercises: [
          {
            id: "n1-c2-l1-e1",
            type: "mcq",
            prompt: "Quel nom de variable est **invalide** en Python ?",
            options: ["nom_eleve", "_score", "2annee", "prenom1"],
            correctIndex: 2,
            xp: 10,
            difficulty: "facile",
            explanation: "Un nom ne peut pas commencer par un chiffre.",
          },
          {
            id: "n1-c2-l1-e2",
            type: "code",
            prompt:
              "Déclare une variable `ville` contenant la chaîne `\"Tunis\"` puis affiche-la.",
            starter: '# ta variable ici\n\nprint(ville)\n',
            solution: 'ville = "Tunis"\nprint(ville)',
            tests: [
              {
                description: "`ville` vaut \"Tunis\"",
                assertion: 'ville == "Tunis"',
              },
              {
                description: "Affiche Tunis",
                assertion: '"Tunis" in _stdout',
              },
            ],
            xp: 20,
            difficulty: "facile",
          },
        ],
      },
      {
        id: "n1-c2-l2",
        chapterId: "n1-c2",
        title: "Les types de données",
        objective:
          "Distinguer entier, réel, chaîne et booléen.",
        xp: 25,
        estimatedMinutes: 10,
        sections: [
          {
            type: "concept",
            title: "Les 4 grands types",
            markdown:
              "| Pseudo-code | Python | Exemple |\n|---|---|---|\n| entier | `int` | `17` |\n| réel | `float` | `3.14` |\n| chaîne | `str` | `\"Tunis\"` |\n| booléen | `bool` | `True` / `False` |",
          },
          {
            type: "code",
            pseudo:
              "TDO :\n  note : réel\n  matiere : chaîne\n  reussi : booléen\nDébut\n  note ← 15.5\n  matiere ← \"Info\"\n  reussi ← Vrai\nFin",
            python:
              'note = 15.5\nmatiere = "Info"\nreussi = True\nprint(type(note), type(matiere), type(reussi))',
          },
          {
            type: "tip",
            markdown:
              "Utilise `type(x)` en Python pour vérifier le type d'une variable.",
          },
        ],
        exercises: [
          {
            id: "n1-c2-l2-e1",
            type: "mcq",
            prompt: "Quel est le type de la valeur `15.5` en Python ?",
            options: ["int", "float", "str", "bool"],
            correctIndex: 1,
            xp: 10,
            difficulty: "facile",
          },
          {
            id: "n1-c2-l2-e2",
            type: "multi-mcq",
            prompt: "Parmi ces valeurs, lesquelles sont des chaînes ?",
            options: ['"Bonjour"', "42", '"17"', "True", '"3.14"'],
            correctIndices: [0, 2, 4],
            xp: 15,
            difficulty: "moyen",
            explanation:
              "Les chaînes sont entre guillemets, même si elles contiennent des chiffres.",
          },
          {
            id: "n1-c2-l2-e3",
            type: "fill",
            prompt: "En pseudo-code tunisien, le booléen « vrai » s'écrit :",
            template: "___",
            answers: ["Vrai", "vrai", "VRAI"],
            xp: 10,
            difficulty: "facile",
          },
        ],
      },
      {
        id: "n1-c2-l3",
        chapterId: "n1-c2",
        title: "Opérations arithmétiques",
        objective: "Utiliser les opérateurs +, -, *, /, //, %, **.",
        xp: 25,
        estimatedMinutes: 10,
        sections: [
          {
            type: "concept",
            title: "Opérateurs Python",
            markdown:
              "- `+` addition, `-` soustraction, `*` multiplication, `/` division.\n- `//` division entière : `7 // 2` = `3`.\n- `%` modulo (reste) : `7 % 2` = `1`.\n- `**` puissance : `2 ** 10` = `1024`.",
          },
          {
            type: "code",
            pseudo:
              "a ← 7\nb ← 2\nÉcrire(a DIV b)  { = 3 }\nÉcrire(a MOD b)  { = 1 }",
            python:
              "a = 7\nb = 2\nprint(a // b)  # 3\nprint(a % b)   # 1",
          },
          {
            type: "example",
            markdown:
              "**Test de parité** : un nombre `n` est pair si `n % 2 == 0`.",
          },
        ],
        exercises: [
          {
            id: "n1-c2-l3-e1",
            type: "mcq",
            prompt: "Que vaut `17 % 5` ?",
            options: ["2", "3", "12", "3.4"],
            correctIndex: 0,
            xp: 10,
            difficulty: "facile",
          },
          {
            id: "n1-c2-l3-e2",
            type: "code",
            prompt:
              "Calcule la moyenne de trois notes 12, 15 et 18 dans une variable `moyenne`, puis affiche-la.",
            starter: "n1 = 12\nn2 = 15\nn3 = 18\n# calcule moyenne\n\nprint(moyenne)\n",
            solution: "n1 = 12\nn2 = 15\nn3 = 18\nmoyenne = (n1 + n2 + n3) / 3\nprint(moyenne)",
            tests: [
              { description: "Moyenne correcte", assertion: "abs(moyenne - 15) < 0.01" },
            ],
            xp: 20,
            difficulty: "facile",
          },
          {
            id: "n1-c2-l3-e3",
            type: "code",
            prompt:
              "Écris un programme qui détermine si 2024 est une année bissextile. Stocke le résultat dans la variable `bissextile` (booléen).\n\n*Rappel : une année est bissextile si elle est divisible par 4 mais pas par 100, sauf si elle est divisible par 400.*",
            starter: "annee = 2024\n# calcule bissextile\n\nprint(bissextile)\n",
            solution:
              "annee = 2024\nbissextile = (annee % 4 == 0 and annee % 100 != 0) or (annee % 400 == 0)\nprint(bissextile)",
            tests: [
              { description: "2024 doit être bissextile", assertion: "bissextile == True" },
            ],
            hints: [
              "Utilise le modulo `%` pour tester la divisibilité.",
              "Combine plusieurs conditions avec `and` et `or`.",
            ],
            xp: 30,
            difficulty: "moyen",
          },
        ],
      },
    ],
    boss: {
      id: "n1-c2-boss",
      title: "Boss : Maître des variables",
      description: "Cinq questions. 2 minutes. Vas-tu tout rafler ?",
      xp: 60,
      timeLimitSeconds: 120,
      questions: [
        {
          id: "n1-c2-boss-q1",
          type: "mcq",
          prompt: "Quel type est `True` ?",
          options: ["int", "str", "bool", "float"],
          correctIndex: 2,
          xp: 12,
          difficulty: "facile",
        },
        {
          id: "n1-c2-boss-q2",
          type: "mcq",
          prompt: "Que vaut `2 ** 5` ?",
          options: ["10", "25", "32", "7"],
          correctIndex: 2,
          xp: 12,
          difficulty: "facile",
        },
        {
          id: "n1-c2-boss-q3",
          type: "mcq",
          prompt: "Résultat de `15 // 4` ?",
          options: ["3", "3.75", "4", "11"],
          correctIndex: 0,
          xp: 12,
          difficulty: "moyen",
        },
        {
          id: "n1-c2-boss-q4",
          type: "fill",
          prompt: "Affecte la valeur 20 à la variable `age` en Python :",
          template: "____",
          answers: ["age = 20", "age=20"],
          xp: 12,
          difficulty: "moyen",
        },
        {
          id: "n1-c2-boss-q5",
          type: "mcq",
          prompt: "Quelle expression teste si `n` est impair ?",
          options: ["n / 2 == 1", "n % 2 == 0", "n % 2 == 1", "n // 2 != 0"],
          correctIndex: 2,
          xp: 15,
          difficulty: "moyen",
        },
      ],
    },
  },

  // ============================================================
  // Chapitre 3 — Entrées / sorties
  // ============================================================
  {
    id: "n1-c3",
    levelId: "niveau1",
    title: "Entrées et sorties",
    description:
      "Lire des données au clavier, afficher des résultats joliment.",
    emoji: "⌨️",
    lessons: [
      {
        id: "n1-c3-l1",
        chapterId: "n1-c3",
        title: "Lire une valeur au clavier",
        objective: "Utiliser Lire / input() et convertir le type.",
        xp: 25,
        estimatedMinutes: 10,
        sections: [
          {
            type: "text",
            markdown:
              "`Lire` (pseudo-code) et `input()` (Python) permettent à l'utilisateur de taper une valeur au clavier. **Attention** : `input()` renvoie toujours une **chaîne de caractères** en Python !",
          },
          {
            type: "code",
            pseudo:
              "TDO : age : entier\nDébut\n  Écrire(\"Ton âge ?\")\n  Lire(age)\n  Écrire(\"Dans 10 ans tu auras \", age + 10, \" ans.\")\nFin",
            python:
              'age = int(input("Ton âge ? "))\nprint("Dans 10 ans tu auras", age + 10, "ans.")',
          },
          {
            type: "concept",
            title: "Convertir le type",
            markdown:
              "- `int(x)` : convertit en entier.\n- `float(x)` : convertit en réel.\n- `str(x)` : convertit en chaîne.",
          },
          {
            type: "warning",
            markdown:
              "Dans notre environnement d'exercices, `input()` ne sera pas demandé à l'utilisateur : on te donnera les valeurs directement dans les variables pour tester.",
          },
        ],
        exercises: [
          {
            id: "n1-c3-l1-e1",
            type: "mcq",
            prompt: "Quel est le type du résultat de `input(\"age ?\")` ?",
            options: ["int", "float", "str", "bool"],
            correctIndex: 2,
            xp: 10,
            difficulty: "facile",
          },
          {
            id: "n1-c3-l1-e2",
            type: "code",
            prompt:
              "On te donne `a = 7` et `b = 3`. Calcule leur somme, leur produit, leur division entière et le reste, et stocke-les dans `somme`, `produit`, `div`, `reste`.",
            starter: "a = 7\nb = 3\n# à toi\n\nprint(somme, produit, div, reste)\n",
            solution:
              "a = 7\nb = 3\nsomme = a + b\nproduit = a * b\ndiv = a // b\nreste = a % b\nprint(somme, produit, div, reste)",
            tests: [
              { description: "somme", assertion: "somme == 10" },
              { description: "produit", assertion: "produit == 21" },
              { description: "div", assertion: "div == 2" },
              { description: "reste", assertion: "reste == 1" },
            ],
            xp: 25,
            difficulty: "moyen",
          },
        ],
      },
    ],
  },

  // ============================================================
  // Chapitre 4 — Structures conditionnelles
  // ============================================================
  {
    id: "n1-c4",
    levelId: "niveau1",
    title: "Structures conditionnelles",
    description:
      "Prendre des décisions : si, sinon, sinon si, opérateurs logiques.",
    emoji: "🔀",
    lessons: [
      {
        id: "n1-c4-l1",
        chapterId: "n1-c4",
        title: "Si... Alors... Sinon",
        objective: "Exécuter du code selon une condition.",
        xp: 30,
        estimatedMinutes: 12,
        sections: [
          {
            type: "text",
            markdown:
              "Une **structure conditionnelle** permet à l'algorithme de prendre une décision selon une condition.",
          },
          {
            type: "code",
            pseudo:
              "Si note ≥ 10 Alors\n  Écrire(\"Admis\")\nSinon\n  Écrire(\"Refusé\")\nFinSi",
            python:
              'if note >= 10:\n    print("Admis")\nelse:\n    print("Refusé")',
            explanation:
              "En Python, pas de `FinSi` : c'est l'indentation qui délimite le bloc.",
          },
          {
            type: "concept",
            title: "Opérateurs de comparaison",
            markdown:
              "`==` égal, `!=` différent, `<` inférieur, `<=` inférieur ou égal, `>` supérieur, `>=` supérieur ou égal.",
          },
          {
            type: "warning",
            markdown:
              "Attention à `=` (affectation) vs `==` (comparaison). C'est l'erreur la plus classique !",
          },
        ],
        exercises: [
          {
            id: "n1-c4-l1-e1",
            type: "mcq",
            prompt:
              "Quel opérateur utilise-t-on pour TESTER l'égalité en Python ?",
            options: ["=", "==", "===", "équal"],
            correctIndex: 1,
            xp: 10,
            difficulty: "facile",
          },
          {
            id: "n1-c4-l1-e2",
            type: "code",
            prompt:
              "La note est dans `note`. Affecte `\"Admis\"` à `resultat` si la note ≥ 10, sinon `\"Refusé\"`.",
            starter: "note = 12\n# à toi\n\nprint(resultat)\n",
            solution:
              'note = 12\nif note >= 10:\n    resultat = "Admis"\nelse:\n    resultat = "Refusé"\nprint(resultat)',
            tests: [{ description: "Résultat = Admis", assertion: 'resultat == "Admis"' }],
            xp: 20,
            difficulty: "facile",
          },
        ],
      },
      {
        id: "n1-c4-l2",
        chapterId: "n1-c4",
        title: "Sinon Si et conditions multiples",
        objective: "Gérer plusieurs cas avec elif.",
        xp: 30,
        estimatedMinutes: 12,
        sections: [
          {
            type: "code",
            pseudo:
              "Si moy ≥ 16 Alors\n  mention ← \"Très bien\"\nSinon Si moy ≥ 14 Alors\n  mention ← \"Bien\"\nSinon Si moy ≥ 12 Alors\n  mention ← \"Assez bien\"\nSinon Si moy ≥ 10 Alors\n  mention ← \"Passable\"\nSinon\n  mention ← \"Refusé\"\nFinSi",
            python:
              'if moy >= 16:\n    mention = "Très bien"\nelif moy >= 14:\n    mention = "Bien"\nelif moy >= 12:\n    mention = "Assez bien"\nelif moy >= 10:\n    mention = "Passable"\nelse:\n    mention = "Refusé"',
          },
          {
            type: "concept",
            title: "Opérateurs logiques",
            markdown:
              "- `and` : ET logique. Vrai si les deux sont vrais.\n- `or` : OU logique. Vrai si au moins un est vrai.\n- `not` : NON logique. Inverse.",
          },
          {
            type: "example",
            markdown:
              "`if age >= 18 and a_le_permis:` → seule condition vraie si **les deux** sont vrais.",
          },
        ],
        exercises: [
          {
            id: "n1-c4-l2-e1",
            type: "code",
            prompt:
              "En fonction de `moy` (déjà défini), détermine la `mention` selon l'échelle officielle : TB ≥ 16, B ≥ 14, AB ≥ 12, Passable ≥ 10, sinon Refusé.",
            starter: 'moy = 14.5\n# à toi\n\nprint(mention)\n',
            solution:
              'moy = 14.5\nif moy >= 16:\n    mention = "Très bien"\nelif moy >= 14:\n    mention = "Bien"\nelif moy >= 12:\n    mention = "Assez bien"\nelif moy >= 10:\n    mention = "Passable"\nelse:\n    mention = "Refusé"\nprint(mention)',
            tests: [{ description: "Bien", assertion: 'mention == "Bien"' }],
            xp: 25,
            difficulty: "moyen",
          },
          {
            id: "n1-c4-l2-e2",
            type: "code",
            prompt:
              "`temp` est la température. Si elle est entre 20 et 30 inclus, mets `confort` à True, sinon False.",
            starter: "temp = 25\n# à toi\n\nprint(confort)\n",
            solution:
              "temp = 25\nconfort = 20 <= temp <= 30\nprint(confort)",
            tests: [
              { description: "Confort True", assertion: "confort == True" },
            ],
            hints: ["Python permet d'écrire `20 <= temp <= 30` directement."],
            xp: 25,
            difficulty: "moyen",
          },
        ],
      },
    ],
    boss: {
      id: "n1-c4-boss",
      title: "Boss : Le Juge",
      description: "Saura-t-il rendre justice à tes conditions ?",
      xp: 70,
      timeLimitSeconds: 150,
      questions: [
        {
          id: "n1-c4-boss-q1",
          type: "mcq",
          prompt: "Que fait `if x % 2 == 0:` ?",
          options: [
            "Teste si x est pair",
            "Teste si x est impair",
            "Divise x par 2",
            "Affecte 0 à x",
          ],
          correctIndex: 0,
          xp: 15,
          difficulty: "facile",
        },
        {
          id: "n1-c4-boss-q2",
          type: "mcq",
          prompt: "Laquelle de ces expressions vaut True quand x = 5 ?",
          options: [
            "x > 10 and x < 3",
            "x > 10 or x < 3",
            "x > 3 and x < 10",
            "not (x == 5)",
          ],
          correctIndex: 2,
          xp: 15,
          difficulty: "moyen",
        },
        {
          id: "n1-c4-boss-q3",
          type: "mcq",
          prompt: "L'équivalent pseudo-code de `elif` en Python est :",
          options: ["Sinon", "Sinon Si", "Si Si", "FinSi"],
          correctIndex: 1,
          xp: 15,
          difficulty: "facile",
        },
        {
          id: "n1-c4-boss-q4",
          type: "code",
          prompt:
            "Retourne `\"pair\"` ou `\"impair\"` dans la variable `parite` selon le contenu de `n`.",
          starter: "n = 13\n# à toi\n\nprint(parite)\n",
          solution:
            'n = 13\nif n % 2 == 0:\n    parite = "pair"\nelse:\n    parite = "impair"\nprint(parite)',
          tests: [{ description: "Impair", assertion: 'parite == "impair"' }],
          xp: 25,
          difficulty: "moyen",
        },
      ],
    },
  },

  // ============================================================
  // Chapitre 5 — Boucles
  // ============================================================
  {
    id: "n1-c5",
    levelId: "niveau1",
    title: "Boucles : répéter intelligemment",
    description:
      "Pour... à faire, Tant que... faire : automatise les répétitions.",
    emoji: "🔁",
    lessons: [
      {
        id: "n1-c5-l1",
        chapterId: "n1-c5",
        title: "La boucle Pour (for)",
        objective: "Itérer un nombre défini de fois.",
        xp: 30,
        estimatedMinutes: 12,
        sections: [
          {
            type: "text",
            markdown:
              "La boucle **Pour** (ou `for`) permet de répéter un bloc d'instructions un nombre **connu** de fois.",
          },
          {
            type: "code",
            pseudo:
              "Pour i de 1 à 5 Faire\n  Écrire(i)\nFin Pour",
            python:
              "for i in range(1, 6):\n    print(i)",
            explanation:
              "`range(1, 6)` génère les entiers 1, 2, 3, 4, 5 (le 6 est exclu !).",
          },
          {
            type: "concept",
            title: "La fonction range()",
            markdown:
              "- `range(n)` → 0, 1, ..., n-1\n- `range(a, b)` → a, a+1, ..., b-1\n- `range(a, b, pas)` → a, a+pas, a+2·pas, ... < b",
          },
          {
            type: "tip",
            markdown:
              "Utilise `range(10, 0, -1)` pour compter à rebours 10, 9, 8, ..., 1.",
          },
        ],
        exercises: [
          {
            id: "n1-c5-l1-e1",
            type: "code",
            prompt:
              "Calcule la somme 1 + 2 + ... + 100 dans la variable `somme`.",
            starter: "somme = 0\n# à toi\n\nprint(somme)\n",
            solution: "somme = 0\nfor i in range(1, 101):\n    somme += i\nprint(somme)",
            tests: [{ description: "5050", assertion: "somme == 5050" }],
            xp: 25,
            difficulty: "moyen",
          },
          {
            id: "n1-c5-l1-e2",
            type: "code",
            prompt:
              "Calcule la factorielle de n (produit de 1 à n) dans `fact`.",
            starter: "n = 6\nfact = 1\n# à toi\n\nprint(fact)\n",
            solution: "n = 6\nfact = 1\nfor i in range(1, n+1):\n    fact *= i\nprint(fact)",
            tests: [{ description: "6! = 720", assertion: "fact == 720" }],
            hints: ["Factorielle : 1 × 2 × ... × n"],
            xp: 30,
            difficulty: "moyen",
          },
        ],
      },
      {
        id: "n1-c5-l2",
        chapterId: "n1-c5",
        title: "La boucle Tant que (while)",
        objective: "Répéter tant qu'une condition est vraie.",
        xp: 30,
        estimatedMinutes: 12,
        sections: [
          {
            type: "text",
            markdown:
              "La boucle **Tant que** répète tant qu'une condition reste vraie. On s'en sert quand on ne sait pas à l'avance combien de fois on va itérer.",
          },
          {
            type: "code",
            pseudo:
              "n ← 123\ncompteur ← 0\nTant que n > 0 Faire\n  n ← n DIV 10\n  compteur ← compteur + 1\nFin TantQue",
            python:
              "n = 123\ncompteur = 0\nwhile n > 0:\n    n = n // 10\n    compteur += 1\nprint(compteur)  # 3",
            explanation: "Compte le nombre de chiffres de 123 → 3.",
          },
          {
            type: "warning",
            markdown:
              "Attention à la **boucle infinie** ! Il faut toujours que la condition puisse devenir fausse.",
          },
        ],
        exercises: [
          {
            id: "n1-c5-l2-e1",
            type: "code",
            prompt:
              "Calcule le nombre de chiffres de l'entier positif `n` dans `nb_chiffres`.",
            starter: "n = 45678\nnb_chiffres = 0\n# à toi\n\nprint(nb_chiffres)\n",
            solution:
              "n = 45678\nnb_chiffres = 0\nx = n\nwhile x > 0:\n    x //= 10\n    nb_chiffres += 1\nprint(nb_chiffres)",
            tests: [{ description: "45678 → 5 chiffres", assertion: "nb_chiffres == 5" }],
            hints: ["Divise n par 10 à chaque itération jusqu'à ce que n soit 0."],
            xp: 30,
            difficulty: "moyen",
          },
          {
            id: "n1-c5-l2-e2",
            type: "code",
            prompt:
              "Vérifie si `n` est premier. Mets `True` ou `False` dans `premier`.",
            starter: "n = 17\n# à toi\n\nprint(premier)\n",
            solution:
              "n = 17\nif n < 2:\n    premier = False\nelse:\n    premier = True\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            premier = False\n            break\n        d += 1\nprint(premier)",
            tests: [{ description: "17 est premier", assertion: "premier == True" }],
            hints: [
              "Un nombre est premier s'il n'est divisible que par 1 et lui-même.",
              "Il suffit de tester les diviseurs jusqu'à √n.",
            ],
            xp: 40,
            difficulty: "difficile",
          },
        ],
      },
    ],
    boss: {
      id: "n1-c5-boss",
      title: "Boss : Le Boucleur Fou",
      description: "Il tourne, tourne... sauras-tu l'arrêter ?",
      xp: 80,
      timeLimitSeconds: 180,
      questions: [
        {
          id: "n1-c5-boss-q1",
          type: "mcq",
          prompt: "Combien d'itérations fait `for i in range(2, 10, 2):` ?",
          options: ["2", "4", "5", "8"],
          correctIndex: 1,
          xp: 15,
          difficulty: "moyen",
          explanation: "i prend les valeurs 2, 4, 6, 8 — soit 4 itérations.",
        },
        {
          id: "n1-c5-boss-q2",
          type: "mcq",
          prompt:
            "Après `x = 0` puis `while x < 5:` `x += 2`, que vaut x ?",
          options: ["4", "5", "6", "Infini"],
          correctIndex: 2,
          xp: 15,
          difficulty: "moyen",
        },
        {
          id: "n1-c5-boss-q3",
          type: "code",
          prompt:
            "Calcule la somme des carrés 1² + 2² + ... + n² dans `somme`.",
          starter: "n = 5\nsomme = 0\n# à toi\n\nprint(somme)\n",
          solution:
            "n = 5\nsomme = 0\nfor i in range(1, n+1):\n    somme += i*i\nprint(somme)",
          tests: [{ description: "n=5 → 55", assertion: "somme == 55" }],
          xp: 30,
          difficulty: "moyen",
        },
        {
          id: "n1-c5-boss-q4",
          type: "mcq",
          prompt: "Quelle boucle choisir quand on ne connaît PAS le nombre d'itérations ?",
          options: ["for", "while", "if", "range"],
          correctIndex: 1,
          xp: 15,
          difficulty: "facile",
        },
      ],
    },
  },
];
