"use client";

import { useState } from "react";
import FeedbackPanel from "./FeedbackPanel";

interface WritingEvaluation {
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  overallBand: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  feedback: string;
}

export default function WritingRunner({
  taskId,
  minWords,
}: {
  taskId: string;
  minWords: number;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WritingEvaluation | null>(null);

  const wordCount = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/writing/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, responseText: text }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Xatolik yuz berdi.");
      return;
    }
    setResult(data);
  }

  if (result) {
    return (
      <div className="mt-6">
        <FeedbackPanel
          overallBand={result.overallBand}
          criteria={[
            { label: "Task Achievement", value: result.taskAchievement },
            { label: "Coherence & Cohesion", value: result.coherenceCohesion },
            { label: "Lexical Resource", value: result.lexicalResource },
            { label: "Grammatical Range", value: result.grammaticalRange },
          ]}
          strengths={result.strengths}
          weaknesses={result.weaknesses}
          suggestions={result.suggestions}
          feedback={result.feedback}
        />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={16}
        placeholder="Javobingizni shu yerga yozing..."
        className="w-full rounded-xl border border-slate-300 p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-sm ${wordCount < minWords ? "text-amber-600" : "text-green-600"}`}>
          {wordCount} / {minWords} so&apos;z
        </span>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting || wordCount === 0}
        className="mt-4 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? "AI baholamoqda..." : "Baholash uchun yuborish"}
      </button>
    </div>
  );
}
