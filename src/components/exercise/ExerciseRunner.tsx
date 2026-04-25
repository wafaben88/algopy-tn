"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Sparkles, Lightbulb, RefreshCw, Play } from "lucide-react";
import confetti from "canvas-confetti";
import type {
  Exercise,
  McqExercise,
  MultiMcqExercise,
  FillBlankExercise,
  OrderExercise,
  CodeExercise,
} from "@/lib/curriculum/types";
import { useProgressStore } from "@/lib/store/useProgressStore";
import { runTests } from "@/lib/pyodide/runner";
import { cn } from "@/lib/utils/cn";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "@/components/lesson/CodeBlock";

interface Props {
  exercise: Exercise;
  onSolved?: (xp: number) => void;
  autoAward?: boolean;
}

export function ExerciseRunner({ exercise, onSolved, autoAward = true }: Props) {
  // `key` on each inner runner forces React to remount when the exercise
  // changes, so local UI state (`selected`, `status`, code, order, ...) is
  // never carried over from a previously verified exercise. Each runner
  // then derives its initial state from the store: if the exercise is
  // already completed, it mounts in a "déjà gagné" review state.
  switch (exercise.type) {
    case "mcq":
      return <McqRunner key={exercise.id} exercise={exercise} onSolved={onSolved} autoAward={autoAward} />;
    case "multi-mcq":
      return <MultiMcqRunner key={exercise.id} exercise={exercise} onSolved={onSolved} autoAward={autoAward} />;
    case "fill":
      return <FillRunner key={exercise.id} exercise={exercise} onSolved={onSolved} autoAward={autoAward} />;
    case "order":
      return <OrderRunner key={exercise.id} exercise={exercise} onSolved={onSolved} autoAward={autoAward} />;
    case "code":
      return <CodeRunner key={exercise.id} exercise={exercise} onSolved={onSolved} autoAward={autoAward} />;
    default:
      return null;
  }
}

function Shell({
  exercise,
  children,
  footer,
  status,
  explanation,
}: {
  exercise: Exercise;
  children: React.ReactNode;
  footer: React.ReactNode;
  status: "idle" | "correct" | "wrong";
  explanation?: string;
}) {
  return (
    <div
      className={cn(
        "panel-solid overflow-hidden transition-colors",
        status === "correct" && "border-emerald-500/50",
        status === "wrong" && "shake border-rose-500/50",
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] p-5">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs">
            <span className="chip chip-accent">+{exercise.xp} XP</span>
            <span
              className={cn(
                "chip",
                exercise.difficulty === "facile" && "chip-success",
                exercise.difficulty === "moyen" && "chip-warning",
                exercise.difficulty === "difficile" && "chip",
              )}
            >
              {exercise.difficulty}
            </span>
          </div>
          <div className="prose-lesson text-base font-medium">
            <ReactMarkdown>{exercise.prompt}</ReactMarkdown>
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
      {(status !== "idle" && (explanation || exercise.explanation)) && (
        <div
          className={cn(
            "border-t px-5 py-3 text-sm",
            status === "correct"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/30 bg-rose-500/10 text-rose-200",
          )}
        >
          <div className="flex items-start gap-2">
            {status === "correct" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0" />
            )}
            <div>{explanation ?? exercise.explanation}</div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] bg-[var(--background)]/40 p-4">
        {footer}
      </div>
    </div>
  );
}

function celebrate() {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#7c5cff", "#22d3ee", "#f472b6", "#fbbf24"],
  });
}

function useAward(exercise: Exercise, autoAward: boolean, onSolved?: (xp: number) => void) {
  const completeExercise = useProgressStore((s) => s.completeExercise);
  const completedExercises = useProgressStore((s) => s.completedExercises);
  const loseHeart = useProgressStore((s) => s.loseHeart);
  const done = completedExercises.includes(exercise.id);
  return {
    done,
    award: () => {
      if (autoAward && !done) completeExercise(exercise.id, exercise.xp);
      onSolved?.(exercise.xp);
      celebrate();
    },
    wrong: () => {
      loseHeart();
    },
  };
}

// ============================================================
// MCQ
// ============================================================
function McqRunner({
  exercise,
  onSolved,
  autoAward,
}: {
  exercise: McqExercise;
  onSolved?: (xp: number) => void;
  autoAward: boolean;
}) {
  const { done, award, wrong } = useAward(exercise, autoAward, onSolved);
  const [selected, setSelected] = useState<number | null>(
    done ? exercise.correctIndex : null,
  );
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">(
    done ? "correct" : "idle",
  );

  const check = () => {
    if (selected === null) return;
    if (selected === exercise.correctIndex) {
      setStatus("correct");
      award();
    } else {
      setStatus("wrong");
      wrong();
    }
  };

  const reset = () => {
    setStatus("idle");
    setSelected(null);
  };

  return (
    <Shell
      exercise={exercise}
      status={status}
      footer={
        status === "idle" ? (
          <button
            className="btn btn-primary"
            disabled={selected === null}
            onClick={check}
          >
            Vérifier
          </button>
        ) : status === "wrong" ? (
          <button className="btn btn-ghost" onClick={reset}>
            <RefreshCw className="size-4" /> Réessayer
          </button>
        ) : (
          <span className="chip chip-success">
            <Sparkles className="size-3" /> Bravo {done ? "(déjà gagné)" : `+${exercise.xp} XP`}
          </span>
        )
      }
    >
      <div className="space-y-2">
        {exercise.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = status !== "idle" && i === exercise.correctIndex;
          const isWrong = status === "wrong" && isSelected;
          return (
            <button
              key={i}
              onClick={() => status === "idle" && setSelected(i)}
              disabled={status !== "idle"}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left transition-all",
                "flex items-center gap-3",
                isCorrect && "border-emerald-500/60 bg-emerald-500/15",
                isWrong && "border-rose-500/60 bg-rose-500/15",
                !isCorrect && !isWrong && isSelected && "border-[var(--primary)]/60 bg-[var(--primary)]/10",
                !isCorrect && !isWrong && !isSelected && "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]",
              )}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full border text-xs font-semibold",
                  isSelected
                    ? "border-[var(--primary-glow)] bg-[var(--primary)]/20 text-white"
                    : "border-[var(--border)] text-[var(--muted)]",
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

// ============================================================
// Multi-MCQ
// ============================================================
function MultiMcqRunner({
  exercise,
  onSolved,
  autoAward,
}: {
  exercise: MultiMcqExercise;
  onSolved?: (xp: number) => void;
  autoAward: boolean;
}) {
  const { done, award, wrong } = useAward(exercise, autoAward, onSolved);
  const [selected, setSelected] = useState<number[]>(
    done ? [...exercise.correctIndices] : [],
  );
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">(
    done ? "correct" : "idle",
  );

  const toggle = (i: number) => {
    if (status !== "idle") return;
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  };

  const check = () => {
    const correct =
      selected.length === exercise.correctIndices.length &&
      exercise.correctIndices.every((i) => selected.includes(i));
    if (correct) {
      setStatus("correct");
      award();
    } else {
      setStatus("wrong");
      wrong();
    }
  };

  return (
    <Shell
      exercise={exercise}
      status={status}
      footer={
        status === "idle" ? (
          <button className="btn btn-primary" disabled={!selected.length} onClick={check}>
            Vérifier
          </button>
        ) : status === "wrong" ? (
          <button className="btn btn-ghost" onClick={() => { setStatus("idle"); setSelected([]); }}>
            <RefreshCw className="size-4" /> Réessayer
          </button>
        ) : (
          <span className="chip chip-success">Bravo {done ? "(déjà gagné)" : `+${exercise.xp} XP`}</span>
        )
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {exercise.options.map((opt, i) => {
          const isSel = selected.includes(i);
          const should = exercise.correctIndices.includes(i);
          const showGreen = status !== "idle" && should;
          const showRed = status === "wrong" && isSel && !should;
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              disabled={status !== "idle"}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                showGreen && "border-emerald-500/60 bg-emerald-500/15",
                showRed && "border-rose-500/60 bg-rose-500/15",
                !showGreen && !showRed && isSel && "border-[var(--primary)]/60 bg-[var(--primary)]/10",
                !showGreen && !showRed && !isSel && "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]",
              )}
            >
              <span
                className={cn(
                  "grid size-5 place-items-center rounded border",
                  isSel ? "bg-[var(--primary)] border-[var(--primary)]" : "border-[var(--border)]",
                )}
              >
                {isSel && <CheckCircle2 className="size-3.5 text-white" />}
              </span>
              <span className="flex-1 font-mono text-sm">{opt}</span>
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

// ============================================================
// Fill
// ============================================================
function FillRunner({
  exercise,
  onSolved,
  autoAward,
}: {
  exercise: FillBlankExercise;
  onSolved?: (xp: number) => void;
  autoAward: boolean;
}) {
  const { done, award, wrong } = useAward(exercise, autoAward, onSolved);
  const [val, setVal] = useState(done ? exercise.answers[0] ?? "" : "");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">(
    done ? "correct" : "idle",
  );

  const check = () => {
    const ok = exercise.answers.some(
      (a) => a.trim().toLowerCase() === val.trim().toLowerCase(),
    );
    if (ok) { setStatus("correct"); award(); } else { setStatus("wrong"); wrong(); }
  };

  const parts = exercise.template.split(/_{2,}/);

  return (
    <Shell
      exercise={exercise}
      status={status}
      footer={
        status === "idle" ? (
          <button className="btn btn-primary" disabled={!val.trim()} onClick={check}>
            Vérifier
          </button>
        ) : status === "wrong" ? (
          <button className="btn btn-ghost" onClick={() => { setStatus("idle"); setVal(""); }}>
            <RefreshCw className="size-4" /> Réessayer
          </button>
        ) : (
          <span className="chip chip-success">Bravo {done ? "(déjà gagné)" : `+${exercise.xp} XP`}</span>
        )
      }
    >
      <div className="font-mono text-lg flex flex-wrap items-center gap-1">
        {parts.map((p, i) => (
          <span key={i} className="whitespace-pre">
            {p}
            {i < parts.length - 1 && (
              <input
                value={val}
                onChange={(e) => setVal(e.target.value)}
                disabled={status !== "idle"}
                className={cn(
                  "mx-1 inline-block rounded-md border bg-[var(--background)] px-2 py-1 font-mono text-base outline-none min-w-[120px]",
                  status === "correct" && "border-emerald-500",
                  status === "wrong" && "border-rose-500",
                  status === "idle" && "border-[var(--border)] focus:border-[var(--primary)]",
                )}
                placeholder="…"
              />
            )}
          </span>
        ))}
      </div>
      {status === "wrong" && (
        <div className="mt-3 text-sm text-rose-300">
          Attendu : <span className="font-mono">{exercise.answers[0]}</span>
        </div>
      )}
    </Shell>
  );
}

// ============================================================
// Order
// ============================================================
function OrderRunner({
  exercise,
  onSolved,
  autoAward,
}: {
  exercise: OrderExercise;
  onSolved?: (xp: number) => void;
  autoAward: boolean;
}) {
  const { done, award, wrong } = useAward(exercise, autoAward, onSolved);
  const [order, setOrder] = useState<number[]>(() =>
    done ? [...exercise.correctOrder] : exercise.items.map((_, i) => i),
  );
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">(
    done ? "correct" : "idle",
  );

  const move = (idx: number, dir: -1 | 1) => {
    if (status !== "idle") return;
    const j = idx + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[idx], next[j]] = [next[j], next[idx]];
    setOrder(next);
  };

  const check = () => {
    const ok = order.every((v, i) => v === exercise.correctOrder[i]);
    if (ok) { setStatus("correct"); award(); } else { setStatus("wrong"); wrong(); }
  };

  return (
    <Shell
      exercise={exercise}
      status={status}
      footer={
        status === "idle" ? (
          <button className="btn btn-primary" onClick={check}>Vérifier</button>
        ) : status === "wrong" ? (
          <button className="btn btn-ghost" onClick={() => { setStatus("idle"); }}>
            <RefreshCw className="size-4" /> Réessayer
          </button>
        ) : (
          <span className="chip chip-success">Bravo {done ? "(déjà gagné)" : `+${exercise.xp} XP`}</span>
        )
      }
    >
      <ol className="space-y-2">
        {order.map((itemIdx, pos) => (
          <li
            key={pos}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2",
              status === "correct"
                ? "border-emerald-500/50 bg-emerald-500/10"
                : status === "wrong"
                  ? "border-rose-500/40 bg-rose-500/10"
                  : "border-[var(--border)] bg-[var(--card)]",
            )}
          >
            <span className="grid size-7 place-items-center rounded-full bg-[var(--primary)]/20 text-sm font-bold text-[var(--primary-glow)]">
              {pos + 1}
            </span>
            <span className="flex-1">{exercise.items[itemIdx]}</span>
            <div className="flex gap-1">
              <button
                onClick={() => move(pos, -1)}
                disabled={pos === 0 || status !== "idle"}
                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => move(pos, 1)}
                disabled={pos === order.length - 1 || status !== "idle"}
                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs disabled:opacity-30"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ol>
    </Shell>
  );
}

// ============================================================
// Code
// ============================================================
function CodeRunner({
  exercise,
  onSolved,
  autoAward,
}: {
  exercise: CodeExercise;
  onSolved?: (xp: number) => void;
  autoAward: boolean;
}) {
  const recordPythonRun = useProgressStore((s) => s.recordPythonRun);
  const recordPerfectQuiz = useProgressStore((s) => s.recordPerfectQuiz);
  const { done, award, wrong } = useAward(exercise, autoAward, onSolved);
  const [code, setCode] = useState(
    done ? exercise.solution : exercise.starter,
  );
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">(
    done ? "correct" : "idle",
  );
  const [running, setRunning] = useState(false);
  const [pyLoading, setPyLoading] = useState(false);
  const [results, setResults] = useState<
    { description: string; passed: boolean; message?: string }[]
  >([]);
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [hintIdx, setHintIdx] = useState(-1);

  const run = async () => {
    setRunning(true);
    setStatus("idle");
    setPyLoading(true);
    try {
      const { run, results } = await runTests(code, exercise.tests);
      setPyLoading(false);
      recordPythonRun();
      setStdout(run.stdout);
      setStderr(run.stderr);
      setResults(results);
      if (run.error) {
        setStatus("wrong");
        wrong();
        return;
      }
      const allPassed = results.every((r) => r.passed);
      if (allPassed) {
        setStatus("correct");
        if (exercise.difficulty !== "facile") recordPerfectQuiz();
        award();
      } else {
        setStatus("wrong");
        wrong();
      }
    } catch (e) {
      setPyLoading(false);
      setStderr(String(e));
      setStatus("wrong");
    } finally {
      setRunning(false);
    }
  };

  const reveal = () => {
    setCode(exercise.solution);
  };

  return (
    <Shell
      exercise={exercise}
      status={status}
      footer={
        <div className="flex flex-wrap items-center gap-2">
          {exercise.hints && exercise.hints.length > 0 && hintIdx < exercise.hints.length - 1 && (
            <button
              className="btn btn-ghost text-xs"
              onClick={() => setHintIdx((i) => i + 1)}
            >
              <Lightbulb className="size-3.5" />
              Indice ({hintIdx + 2}/{exercise.hints.length})
            </button>
          )}
          {status === "wrong" && (
            <button className="btn btn-ghost text-xs" onClick={reveal}>
              Voir la solution
            </button>
          )}
          <button className="btn btn-primary" onClick={run} disabled={running}>
            <Play className="size-4" />
            {running ? (pyLoading ? "Chargement Python…" : "Exécution…") : "Lancer & vérifier"}
          </button>
          {status === "correct" && (
            <span className="chip chip-success">
              <Sparkles className="size-3" /> {done ? "déjà réussi" : `+${exercise.xp} XP`}
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-3">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full min-h-[180px] rounded-xl border border-[var(--border)] bg-[#0a1020] p-4 font-mono text-sm text-[#e5ecff] outline-none focus:border-[var(--primary)]"
        />
        {hintIdx >= 0 && exercise.hints && (
          <div className="space-y-2">
            {exercise.hints.slice(0, hintIdx + 1).map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100"
              >
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-400" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}
        <AnimatePresence>
          {(stdout || stderr || results.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {stdout && (
                <div>
                  <div className="mb-1 text-xs text-[var(--muted)] font-semibold">Sortie</div>
                  <CodeBlock code={stdout} language="text" />
                </div>
              )}
              {stderr && (
                <div>
                  <div className="mb-1 text-xs text-rose-400 font-semibold">Erreurs</div>
                  <CodeBlock code={stderr} language="text" />
                </div>
              )}
              {results.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-[var(--muted)] font-semibold">Tests</div>
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                        r.passed
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                          : "border-rose-500/40 bg-rose-500/10 text-rose-200",
                      )}
                    >
                      {r.passed ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      <span className="flex-1">{r.description}</span>
                      {r.message && !r.passed && (
                        <span className="text-xs opacity-70">{r.message}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Shell>
  );
}
