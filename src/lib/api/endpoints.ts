// Typed wrappers around `apiFetch` for the AlgoPy backend endpoints.

import { apiFetch } from "./client";
import type {
  ApiChapter,
  ApiCorrection,
  ApiDifficulty,
  ApiExercise,
  ApiExerciseType,
  ApiLesson,
  ApiLessonImage,
  ApiSection,
  AuthResponse,
} from "./types";

// --- Auth ---------------------------------------------------------------------

export const auth = {
  register: (data: { email: string; name: string; password: string }) =>
    apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      json: data,
      withAuth: false,
    }),
  login: (data: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      json: data,
      withAuth: false,
    }),
  me: () => apiFetch<{ user: AuthResponse["user"] }>("/api/auth/me"),
};

// --- Content ------------------------------------------------------------------

export const chapters = {
  list: () => apiFetch<{ chapters: ApiChapter[] }>("/api/chapters/"),
  get: (id: number) => apiFetch<{ chapter: ApiChapter }>(`/api/chapters/${id}`),
  create: (data: {
    title: string;
    description?: string | null;
    order?: number;
    is_published?: boolean;
  }) =>
    apiFetch<{ chapter: ApiChapter }>("/api/chapters/", {
      method: "POST",
      json: data,
    }),
  update: (id: number, data: {
    title: string;
    description?: string | null;
    order?: number;
    is_published?: boolean;
  }) =>
    apiFetch<{ chapter: ApiChapter }>(`/api/chapters/${id}`, {
      method: "PATCH",
      json: data,
    }),
  remove: (id: number) =>
    apiFetch<void>(`/api/chapters/${id}`, { method: "DELETE" }),
  reorder: (items: { id: number; order: number }[]) =>
    apiFetch<{ updated: number }>("/api/chapters/reorder", {
      method: "POST",
      json: { items },
    }),
};

export const sections = {
  create: (data: { chapter_id: number; title: string; order?: number }) =>
    apiFetch<{ section: ApiSection }>("/api/sections/", {
      method: "POST",
      json: data,
    }),
  update: (id: number, data: { chapter_id: number; title: string; order?: number }) =>
    apiFetch<{ section: ApiSection }>(`/api/sections/${id}`, {
      method: "PATCH",
      json: data,
    }),
  remove: (id: number) =>
    apiFetch<void>(`/api/sections/${id}`, { method: "DELETE" }),
};

export const lessons = {
  get: (id: number) => apiFetch<{ lesson: ApiLesson }>(`/api/lessons/${id}`),
  create: (data: {
    section_id: number;
    title: string;
    theory_content?: string;
    order?: number;
    is_published?: boolean;
  }) =>
    apiFetch<{ lesson: ApiLesson }>("/api/lessons/", {
      method: "POST",
      json: data,
    }),
  update: (id: number, data: {
    section_id: number;
    title: string;
    theory_content?: string;
    order?: number;
    is_published?: boolean;
  }) =>
    apiFetch<{ lesson: ApiLesson }>(`/api/lessons/${id}`, {
      method: "PATCH",
      json: data,
    }),
  remove: (id: number) =>
    apiFetch<void>(`/api/lessons/${id}`, { method: "DELETE" }),
  uploadImage: (lessonId: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch<{ image: ApiLessonImage }>(`/api/lessons/${lessonId}/images`, {
      method: "POST",
      formData: fd,
    });
  },
  deleteImage: (lessonId: number, imageId: number) =>
    apiFetch<void>(`/api/lessons/${lessonId}/images/${imageId}`, {
      method: "DELETE",
    }),
  refreshImageToken: (lessonId: number, imageId: number) =>
    apiFetch<{ token: string }>(`/api/lessons/${lessonId}/images/${imageId}/token`),
};

export const exercises = {
  get: (id: number) => apiFetch<{ exercise: ApiExercise }>(`/api/exercises/${id}`),
  create: (data: {
    lesson_id: number;
    statement: string;
    type?: ApiExerciseType;
    difficulty?: ApiDifficulty;
    order?: number;
    is_published?: boolean;
  }) =>
    apiFetch<{ exercise: ApiExercise }>("/api/exercises/", {
      method: "POST",
      json: data,
    }),
  update: (id: number, data: {
    lesson_id: number;
    statement: string;
    type: ApiExerciseType;
    difficulty: ApiDifficulty;
    order: number;
    is_published: boolean;
  }) =>
    apiFetch<{ exercise: ApiExercise }>(`/api/exercises/${id}`, {
      method: "PATCH",
      json: data,
    }),
  remove: (id: number) =>
    apiFetch<void>(`/api/exercises/${id}`, { method: "DELETE" }),
  upsertCorrection: (
    exerciseId: number,
    data: { content: string; pseudocode?: string | null; python_code?: string | null },
  ) =>
    apiFetch<{ correction: ApiCorrection }>(
      `/api/exercises/${exerciseId}/correction`,
      { method: "PUT", json: data },
    ),
};

// --- AI -----------------------------------------------------------------------

export const ai = {
  generateExercises: (
    lessonId: number,
    data: { n: number; level: string; type: ApiExerciseType },
  ) =>
    apiFetch<{ exercises: ApiExercise[] }>(
      `/api/ai/lessons/${lessonId}/generate-exercises`,
      { method: "POST", json: data },
    ),
  generateCorrection: (exerciseId: number, persist = true) =>
    apiFetch<{ correction: ApiCorrection; persisted: boolean }>(
      `/api/ai/exercises/${exerciseId}/generate-correction`,
      { method: "POST", json: { persist } },
    ),
};

// --- Progress -----------------------------------------------------------------

export const progress = {
  list: () =>
    apiFetch<{
      progress: {
        id: number;
        user_id: number;
        lesson_id: number;
        completed: boolean;
        score: number;
        updated_at: string;
      }[];
    }>("/api/progress/"),
  recordLesson: (lessonId: number, data: { completed?: boolean; score?: number }) =>
    apiFetch(`/api/progress/lessons/${lessonId}`, {
      method: "POST",
      json: data,
    }),
};
