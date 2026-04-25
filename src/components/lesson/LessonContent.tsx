"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Lightbulb, AlertTriangle, BookOpenCheck, Info } from "lucide-react";
import type { LessonSection } from "@/lib/curriculum/types";
import { DualCode } from "./CodeBlock";

export function LessonContent({ sections }: { sections: LessonSection[] }) {
  return (
    <div className="space-y-4">
      {sections.map((s, i) => (
        <SectionBlock key={i} section={s} />
      ))}
    </div>
  );
}

function SectionBlock({ section }: { section: LessonSection }) {
  if (section.type === "text") {
    return (
      <div className="prose-lesson">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.markdown}</ReactMarkdown>
      </div>
    );
  }
  if (section.type === "concept") {
    return (
      <div className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 p-5">
        <div className="mb-2 flex items-center gap-2 text-[var(--primary-glow)] font-semibold">
          <BookOpenCheck className="size-5" />
          {section.title}
        </div>
        <div className="prose-lesson">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.markdown}</ReactMarkdown>
        </div>
      </div>
    );
  }
  if (section.type === "code") {
    return <DualCode pseudo={section.pseudo} python={section.python} explanation={section.explanation} />;
  }
  if (section.type === "tip") {
    return (
      <div className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
        <Lightbulb className="size-5 shrink-0 text-amber-400" />
        <div className="prose-lesson text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.markdown}</ReactMarkdown>
        </div>
      </div>
    );
  }
  if (section.type === "warning") {
    return (
      <div className="flex gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
        <AlertTriangle className="size-5 shrink-0 text-rose-400" />
        <div className="prose-lesson text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.markdown}</ReactMarkdown>
        </div>
      </div>
    );
  }
  if (section.type === "example") {
    return (
      <div className="flex gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
        <Info className="size-5 shrink-0 text-cyan-400" />
        <div className="prose-lesson text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.markdown}</ReactMarkdown>
        </div>
      </div>
    );
  }
  return null;
}
