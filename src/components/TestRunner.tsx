"use client";

import { useState } from "react";
import BandScoreCard from "./BandScoreCard";

export interface ClientQuestion {
  id: string;
  order: number;
  type: "MCQ" | "TRUE_FALSE_NG" | "FILL_BLANK" | "MATCHING";
  promptText: string;
  options: string[] | null;
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

export default function TestRunner({
  section,
  testId,
  questions,
}: {
  section: "READING" | "LISTENING";
  testId: string;
  questions: ClientQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setAnswer(questionId: string, value: string) {
    setAnswers((a) => ({ ...a, [questionId]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const endpoint =
      section === "READING" ? "/api/reading/submit" : "/api/listening/submit";
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
  }

  if (result) {
    return (
      <div className="mt-6 space-y-6">
        <BandScoreCard
          band={result.bandScore}
          label={`${result.rawScore}/${result.total} to'g'ri javob`}
        />
        <div className="space-y-3">
          {questions.map((q) => {
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
                  {q.order}. {q.promptText}
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
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {questions.map((q) => (
        <div key={q.id} className="rounded-lg border border-slate-200 p-4 bg-white">
          <p className="font-medium text-sm mb-2">
            {q.order}. {q.promptText}
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
            <div className="flex gap-4">
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
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? "Yuborilmoqda..." : "Javoblarni yuborish"}
      </button>
    </div>
  );
}
