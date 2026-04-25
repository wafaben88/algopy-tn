import { getAllChapters } from "@/lib/curriculum";
import { notFound } from "next/navigation";
import { BossView } from "./BossView";

export function generateStaticParams() {
  return getAllChapters()
    .filter((c) => c.boss)
    .map((c) => ({ bossId: c.boss!.id }));
}

export default async function BossPage({
  params,
}: {
  params: Promise<{ bossId: string }>;
}) {
  const { bossId } = await params;
  const chapter = getAllChapters().find((c) => c.boss?.id === bossId);
  if (!chapter || !chapter.boss) notFound();
  return <BossView boss={chapter.boss} chapterTitle={chapter.title} />;
}
