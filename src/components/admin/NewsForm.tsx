"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNewsPost, updateNewsPost, type NewsPostInput } from "@/lib/actions/adminNews";

export default function NewsForm({
  postId,
  initial,
}: {
  postId?: string;
  initial?: NewsPostInput;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !body.trim()) {
      setError("Sarlavha va matn kiritilishi kerak.");
      return;
    }
    setSubmitting(true);
    try {
      const data = { title, body };
      if (postId) {
        await updateNewsPost(postId, data);
      } else {
        await createNewsPost(data);
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
      <div>
        <label className="block text-sm font-medium mb-1">Matn</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
