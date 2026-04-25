// Mirrors the dicts returned by the Flask backend.
// Keep in sync with /backend/src/algopy_backend/models/*.py.

export type UserRole = "admin" | "student";

export type ApiUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
};

export type AuthResponse = {
  user: ApiUser;
  access_token: string;
  refresh_token: string;
};

export type ApiChapter = {
  id: number;
  title: string;
  description: string | null;
  order: number;
  is_published: boolean;
  sections?: ApiSection[];
};

export type ApiSection = {
  id: number;
  chapter_id: number;
  title: string;
  order: number;
  lessons?: ApiLesson[];
};

export type ApiLesson = {
  id: number;
  section_id: number;
  title: string;
  theory_content: string;
  order: number;
  is_published: boolean;
  images?: ApiLessonImage[];
  exercises?: ApiExercise[];
};

export type ApiLessonImage = {
  id: number;
  lesson_id: number;
  filename: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  display_order: number;
  is_protected: boolean;
  // Short-lived JWT token (issued by /api/lessons/<id>).
  token?: string;
};

export type ApiExerciseType = "algorithm" | "python" | "mixed";
export type ApiDifficulty = "easy" | "medium" | "hard";

export type ApiExercise = {
  id: number;
  lesson_id: number;
  statement: string;
  type: ApiExerciseType;
  difficulty: ApiDifficulty;
  order: number;
  generated_by_ai: boolean;
  is_published: boolean;
  correction?: ApiCorrection | null;
};

export type ApiCorrection = {
  id: number;
  exercise_id: number;
  content: string;
  pseudocode: string | null;
  python_code: string | null;
  generated_by_ai: boolean;
};
