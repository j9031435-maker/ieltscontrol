"use client";

import { useState } from "react";
import BandScoreCard from "./BandScoreCard";
import AudioPlayer from "./AudioPlayer";

export interface ClientQuestion {
  id: string;
  order: number;
  type: "MCQ" | "TRUE_FALSE_NG" | "FILL_BLANK" | "MATCHING";
  promptText: string;
  options: string[] | null;
}

export interface ClientPart {
  id: string;
  part: number;
  title: string | null;
  bodyText: string;
  questions: ClientQuestion[];
}

interface ResultDetail {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  correctAnswer: string;
}

interface SubmitResult {
  rawScore: number;
  total: number;
  bandScore: number;
  details: ResultDetail[];
}

const PART_NOUN: Record<"READING" | "LISTENING", string> = {
  READING: "Part",
  LISTENING: "Section",
};

export default function TestRunner({
  section,
  testId,
  parts,
}: {
  section: "READING" | "LISTENING";
  testId: string;
  parts: ClientPart[];
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Question numbers run continuously across parts (1-40), like the real exam.
  const numberOffsets: number[] = [];
  parts.reduce((acc, p) => {
    numberOffsets.push(acc);
    return acc + p.questions.length;
  }, 0);
  const totalQuestions = parts.reduce((acc, p) => acc + p.questions.length, 0);
  const answeredCount = parts
    .flatMap((p) => p.questions)
    .filter((q) => (answers[q.id] ?? "").trim() !== "").length;

  function setAnswer(questionId: string, value: string) {
    setAnswers((a) => ({ ...a, [questionId]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const endpoint = section === "READING" ? "/api/reading/submit" : "/api/listening/submit";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId, answers }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Xatolik yuz berdi.");
      return;
    }
    setResult(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (result) {
    return (
      <div className="space-y-6">
        <BandScoreCard
          band={result.bandScore}
          label={`${result.rawScore}/${result.total} to'g'ri javob`}
        />
        {parts.map((p, pi) => (
          <div key={p.id}>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              {PART_NOUN[section]} {p.part}
              {p.title ? ` — ${p.title}` : ""}
            </h2>
            <div className="space-y-3">
              {p.questions.map((q, qi) => {
                const d = result.details.find((x) => x.questionId === q.id);
                if (!d) return null;
                return (
                  <div
                    key={q.id}
                    className={`rounded-lg border p-4 ${
                      d.correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <p className="font-medium text-sm">
                      {numberOffsets[pi] + qi + 1}. {q.promptText}
                    </p>
                    <p className="text-sm mt-1">
                      Sizning javobingiz:{" "}
                      <span className="font-medium">{d.userAnswer || "(bo'sh)"}</span>
                    </p>
                    {!d.correct && (
                      <p className="text-sm text-slate-700">
                        To&apos;g&apos;ri javob:{" "}
                        <span className="font-medium">{d.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {parts.map((p, pi) => (
        <section key={p.id}>
          <div className="flex items-baseline gap-3 mb-3">
            <h2 className="text-lg font-bold text-slate-900">
              {PART_NOUN[section]} {p.part}
            </h2>
            {p.title && <span className="text-sm text-slate-600">{p.title}</span>}
            <span className="ml-auto text-xs text-slate-500">
              {numberOffsets[pi] + 1}–{numberOffsets[pi] + p.questions.length}-savollar
            </span>
          </div>

          {section === "READING" ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 whitespace-pre-line text-sm leading-relaxed text-slate-800">
              {p.bodyText}
            </div>
          ) : (
            <AudioPlayer script={p.bodyText} />
          )}

          <div className="mt-4 space-y-4">
            {p.questions.map((q, qi) => (
              <div key={q.id} className="rounded-lg border border-slate-200 p-4 bg-white">
                <p className="font-medium text-sm mb-2">
                  {numberOffsets[pi] + qi + 1}. {q.promptText}
                </p>
                {q.type === "MCQ" && q.options && (
                  <div className="space-y-1.5">
                    {q.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => setAnswer(q.id, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "TRUE_FALSE_NG" && (
                  <div className="flex flex-wrap gap-4">
                    {["TRUE", "FALSE", "NOT GIVEN"].map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 text-sm">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => setAnswer(q.id, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "FILL_BLANK" && (
                  <input
                    type="text"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-4 border-t border-slate-200 pt-5">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Yuborilmoqda..." : "Javoblarni yuborish"}
        </button>
        <span className="text-sm text-slate-500">
          {answeredCount}/{totalQuestions} savolga javob berildi
        </span>
      </div>
    </div>
  );
}
