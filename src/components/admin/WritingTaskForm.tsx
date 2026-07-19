"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WritingTaskType } from "@prisma/client";
import {
  createWritingTask,
  updateWritingTask,
  type WritingTaskInput,
} from "@/lib/actions/adminWriting";

export default function WritingTaskForm({
  taskId,
  initial,
}: {
  taskId?: string;
  initial?: WritingTaskInput;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [taskType, setTaskType] = useState<WritingTaskType>(initial?.taskType ?? "TASK2");
  const [minWords, setMinWords] = useState(initial?.minWords ?? 250);
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !prompt.trim()) {
      setError("Sarlavha va topshiriq matni kiritilishi kerak.");
      return;
    }
    setSubmitting(true);
    try {
      const data = { title, taskType, minWords, prompt };
      if (taskId) {
        await updateWritingTask(taskId, data);
      } else {
        await createWritingTask(data);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setError("Saqlashda xatolik yuz berdi.");
      setSubmitting(false);
    }
  }

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
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Turi</label>
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as WritingTaskType)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="TASK1">Task 1</option>
            <option value="TASK2">Task 2</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Minimal so&apos;z soni</label>
          <input
            type="number"
            value={minWords}
            onChange={(e) => setMinWords(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Topshiriq matni</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={10}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
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
