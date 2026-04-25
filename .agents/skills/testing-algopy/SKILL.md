# Testing AlgoPy TN

Gamified Next.js app to learn algorithmics & Python (Tunisian high-school curriculum). Static export, in-browser Python via Pyodide, Zustand + localStorage for progression.

## Stack
- Next.js (App Router) with `output: "export"`, `trailingSlash: true`
- Pyodide (CDN: `https://cdn.jsdelivr.net/pyodide/v0.26.2/full/`) for in-browser Python
- Zustand + `persist` middleware -> localStorage key contains XP / streak / hearts / completed lessons / badges
- Curriculum data: `src/lib/curriculum/niveau{1,2,3}.ts`

## Build & deploy
```bash
npm ci
npm run lint && npm run build       # produces ./out
```

Deploy with the `deploy` tool, frontend mode, on the contents of `./out`.

### devinapps directory-index gotcha (important)
The devinapps static host does NOT auto-serve `/<path>/index.html` for `/<path>/` requests. With `trailingSlash: true`, every internal route would otherwise fall back to the home page.

Workaround already in `src/app/layout.tsx`: a tiny inline `<head>` script rewrites `/<path>/` -> `/<path>/index.html` then cleans the URL with `history.replaceState`. If multi-page routing ever regresses on a fresh deploy, check that the script is still present at the very top of `<head>`. Quick check after deploy:
```bash
curl -s https://<host>/cours/ | md5sum
curl -s https://<host>/         | md5sum
# md5s MUST differ
```
If the build pipeline complains about the deploy ZIP (`Failed to extract project zip`), copy `out/` to a clean dir, remove tilde-named webpack files, drop conflicting `404/` directory + extraneous `.txt`/`__next.*` files, and redeploy from that clean dir.

## Local sanity test (no devinapps)
```bash
npx serve out -l 5000
# or
python3 -m http.server -d out 5000
```
Both correctly serve `index.html` for directory paths, so they bypass the workaround above and let you isolate platform-specific bugs.

## Canonical E2E flow (golden path)
Used to validate gamification end-to-end. All exercises are gated: lesson N+1 unlocks only after lesson N is fully completed.

1. Open `/` -> assert pre-state XP=0, streak=0, hearts=5/5, 0/12 badges, 0/16 lessons.
2. Sidebar -> `Cours` -> click "Qu'est-ce qu'un algorithme ?" (`/cours/n1-c1-l1/`).
3. Tab `Exercices (3)`:
   - Ex 1 (MCQ): answer B `Une suite finie et ordonnée...` -> Vérifier -> +10 XP toast.
   - Ex 2 (MCQ "N'EST PAS"): answer C `Écrit en Python` -> Vérifier -> +10 XP.
   - Ex 3 (ordering, café): final order is `Mettre la poudre / Ajouter de l'eau / Mettre sur le feu / Servir dans la tasse` -> Vérifier -> +15 XP.
   - `Terminer la leçon` -> +20 XP bonus -> badge `Premier pas` 🐣 unlocks. Total = 55 XP, streak=1.
4. `Leçon suivante` -> `/cours/n1-c1-l2/` (Pseudo-code et Python).
   - Ex 1 (MCQ): answer B `print()` -> +10 XP (cumulative 65).
   - Ex 2 (Pyodide code): clear textarea, type `print("Salut, Tunisie !")`, click `Lancer & vérifier`. First click can take 5–15 s on cold load (Pyodide download). Expected: stdout pane shows exactly `Salut, Tunisie !`, test row `Affiche le bon message` goes green, +20 XP.
   - `Terminer la leçon` -> +25 XP bonus -> level-up toast `Niveau 1 atteint`. Total = 110 XP.
5. Hard refresh (Ctrl+R) -> assert state persists from localStorage: 110 XP / Niv 1 (`Apprenti algorithmicien`) / streak 1 / 2 badges / `Leçons 2/16` / N1 progress 20%.

## Known UX gotcha (worth re-testing each release)
In `src/components/exercise/ExerciseRunner.tsx`, transitioning from a freshly-verified exercise to the next one via `Suivant` can briefly render the next exercise in a "completed/revealed" visual state (correct answer highlighted, `Bravo +X XP` pill) WITHOUT actually crediting XP. Workaround during testing: click the exercise's progress dot at the top of the runner to reset its UI to a clean state, then answer + Vérifier normally — XP is then credited correctly. The header XP counter is the source of truth, not the per-exercise pill.

## Recording / annotations
Use the standalone `recording_start` / `recording_stop` / `annotate_recording` tools (NOT `computer(action="record_*")`). If those tools are not available in the environment, fall back to taking labelled screenshots at: pre-state, each `+XP` toast, lesson-complete confetti, Pyodide stdout, and post-refresh home page.

## Devin secrets needed
None. The app is fully client-side and the deploy is anonymous. Pyodide and the GitHub PR comment use the standard built-in tooling (no extra secrets).

## Useful files
- `src/lib/store/useProgressStore.ts` — XP/badges/streak/hearts engine; `completeExercise`, `completeLesson`.
- `src/lib/gamification/xp.ts` — level thresholds (Lycéen curieux 0, Apprenti algorithmicien 100, ...).
- `src/lib/gamification/badges.ts` — badge unlock rules.
- `src/lib/curriculum/niveau1.ts` — first 5 chapters; lesson n1-c1-l2 is the canonical Pyodide test target.
- `src/lib/pyodide/runner.ts` — Pyodide bootstrap + `runPython`.
- `src/components/exercise/ExerciseRunner.tsx` — exercise UI (see UX gotcha).
- `src/app/layout.tsx` — contains the devinapps directory-index redirect script.
