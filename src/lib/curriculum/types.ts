export type Difficulty = "facile" | "moyen" | "difficile";

export type LevelId = "niveau1" | "niveau2" | "niveau3";

export interface Level {
  id: LevelId;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  emoji: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  levelId: LevelId;
  title: string;
  description: string;
  emoji: string;
  lessons: Lesson[];
  boss?: BossBattle;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  objective: string;
  xp: number;
  estimatedMinutes: number;
  sections: LessonSection[];
  exercises: Exercise[];
}

export type LessonSection =
  | { type: "text"; markdown: string }
  | { type: "concept"; title: string; markdown: string }
  | {
      type: "code";
      pseudo: string;
      python: string;
      explanation?: string;
    }
  | { type: "tip"; markdown: string }
  | { type: "warning"; markdown: string }
  | { type: "example"; markdown: string };

export type Exercise =
  | McqExercise
  | MultiMcqExercise
  | FillBlankExercise
  | CodeExercise
  | OrderExercise;

interface ExerciseBase {
  id: string;
  prompt: string;
  xp: number;
  difficulty: Difficulty;
  explanation?: string;
}

export interface McqExercise extends ExerciseBase {
  type: "mcq";
  options: string[];
  correctIndex: number;
}

export interface MultiMcqExercise extends ExerciseBase {
  type: "multi-mcq";
  options: string[];
  correctIndices: number[];
}

export interface FillBlankExercise extends ExerciseBase {
  type: "fill";
  template: string;
  answers: string[];
}

export interface OrderExercise extends ExerciseBase {
  type: "order";
  items: string[];
  correctOrder: number[];
}

export interface CodeExercise extends ExerciseBase {
  type: "code";
  starter: string;
  solution: string;
  tests: CodeTest[];
  hints?: string[];
}

export interface CodeTest {
  description: string;
  /** Python expression that must evaluate to True after starter code runs. */
  assertion: string;
  /** Optional setup code run before the assertion (not shown to user). */
  setup?: string;
}

export interface BossBattle {
  id: string;
  title: string;
  description: string;
  xp: number;
  timeLimitSeconds: number;
  questions: Exercise[];
}
