import { getAllLessons, getLesson, getChapter, getLevel } from "@/lib/curriculum";
import { notFound } from "next/navigation";
import { LessonView } from "./LessonView";

export function generateStaticParams() {
  return getAllLessons().map((l) => ({ lessonId: l.id }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  const chapter = getChapter(lesson.chapterId);
  const level = chapter ? getLevel(chapter.levelId) : undefined;

  return <LessonView lesson={lesson} chapter={chapter} level={level} />;
}
