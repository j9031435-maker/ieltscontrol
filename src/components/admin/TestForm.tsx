"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Section, QuestionType } from "@prisma/client";
import { createTest, updateTest, type QuestionInput } from "@/lib/actions/adminTests";

export interface TestFormInitial {
  title: string;
  description: string;
  bodyText: string;
  questions: QuestionInput[];
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "MCQ", label: "Ko'p tanlovli (MCQ)" },
  { value: "TRUE_FALSE_NG", label: "TRUE / FALSE / NOT GIVEN" },
  { value: "FILL_BLANK", label: "Bo'sh joyni to'ldirish" },
];

const emptyQuestion: QuestionInput = {
  type: "MCQ",
  promptText: "",
  options: "",
  correctAnswer: "",
};

export default function TestForm({
  section,
  testId,
  initial,
}: {
  section: Section;
  testId?: string;
  initial?: TestFormInitial;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [bodyText, setBodyText] = useState(initial?.bodyText ?? "");
  const [questions, setQuestions] = useState<QuestionInput[]>(
    initial?.questions ?? [{ ...emptyQuestion }]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateQuestion(index: number, patch: Partial<QuestionInput>) {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, { ...emptyQuestion }]);
  }

  function removeQuestion(index: number) {
    setQuestions((qs) => qs.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !bodyText.trim() || questions.length === 0) {
      setError("Sarlavha, matn va kamida bitta savol kiritilishi kerak.");
      return;
    }
    setSubmitting(true);
    try {
      const data = { title, description, bodyText, questions };
      if (testId) {
        await updateTest(testId, section, data);
      } else {
        await createTest(section, data);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setError("Saqlashda xatolik yuz berdi.");
      setSubmitting(false);
    }
  }

  const bodyLabel =
    section === "READING" ? "Matn (passage)" : "Skript (Listening uchun ovozli o'qiladi)";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Sarlavha</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tavsif (ixtiyoriy)</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{bodyLabel}</label>
        <textarea
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          rows={10}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Savollar</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
          >
            + Savol qo&apos;shish
          </button>
        </div>
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500">{i + 1}-savol</span>
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  O&apos;chirish
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Turi</label>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(i, { type: e.target.value as QuestionType })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    To&apos;g&apos;ri javob{" "}
                    {q.type === "FILL_BLANK" && "(alternativlar uchun | bilan ajrating)"}
                  </label>
                  <input
                    value={q.correctAnswer}
                    onChange={(e) => updateQuestion(i, { correctAnswer: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-slate-500 mb-1">Savol matni</label>
                <input
                  value={q.promptText}
                  onChange={(e) => updateQuestion(i, { promptText: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
              {q.type === "MCQ" && (
                <div className="mt-3">
                  <label className="block text-xs text-slate-500 mb-1">
                    Variantlar (vergul bilan ajrating)
                  </label>
                  <input
                    value={q.options}
                    onChange={(e) => updateQuestion(i, { options: e.target.value })}
                    placeholder="Variant 1, Variant 2, Variant 3"
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
              )}
              {q.type === "TRUE_FALSE_NG" && (
                <p className="mt-2 text-xs text-slate-500">
                  To&apos;g&apos;ri javob maydoniga aynan: TRUE, FALSE yoki NOT GIVEN deb yozing.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Saqlanmoqda..." : "Saqlash"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-300 hover:bg-slate-50"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
}
