"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSpeakingSet,
  updateSpeakingSet,
  type SpeakingPartInput,
  type SpeakingSetInput,
} from "@/lib/actions/adminSpeaking";

const PART_LABELS = ["Part 1 — Kirish savollari", "Part 2 — Cue Card", "Part 3 — Muhokama"];

function emptyPart(): SpeakingPartInput {
  return { promptText: "", followUps: [""] };
}

export default function SpeakingSetForm({
  originalTitle,
  initial,
}: {
  originalTitle?: string;
  initial?: SpeakingSetInput;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [parts, setParts] = useState<SpeakingPartInput[]>(
    initial ? [initial.part1, initial.part2, initial.part3] : [emptyPart(), emptyPart(), emptyPart()]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updatePart(index: number, patch: Partial<SpeakingPartInput>) {
    setParts((ps) => ps.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function updateFollowUp(partIndex: number, followUpIndex: number, value: string) {
    setParts((ps) =>
      ps.map((p, i) =>
        i === partIndex
          ? { ...p, followUps: p.followUps.map((f, j) => (j === followUpIndex ? value : f)) }
          : p
      )
    );
  }

  function addFollowUp(partIndex: number) {
    setParts((ps) => ps.map((p, i) => (i === partIndex ? { ...p, followUps: [...p.followUps, ""] } : p)));
  }

  function removeFollowUp(partIndex: number, followUpIndex: number) {
    setParts((ps) =>
      ps.map((p, i) =>
        i === partIndex ? { ...p, followUps: p.followUps.filter((_, j) => j !== followUpIndex) } : p
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || parts.some((p) => !p.promptText.trim())) {
      setError("To'plam nomi va har bir qismning asosiy matni kiritilishi kerak.");
      return;
    }
    setSubmitting(true);
    const cleaned = parts.map((p) => ({
      promptText: p.promptText,
      followUps: p.followUps.map((f) => f.trim()).filter(Boolean),
    }));
    const data: SpeakingSetInput = {
      title,
      part1: cleaned[0],
      part2: cleaned[1],
      part3: cleaned[2],
    };
    try {
      if (originalTitle) {
        await updateSpeakingSet(originalTitle, data);
      } else {
        await createSpeakingSet(data);
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
        <label className="block text-sm font-medium mb-1">To&apos;plam nomi</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {parts.map((part, pi) => (
        <div key={pi} className="rounded-lg border border-slate-200 p-4 bg-slate-50">
          <h3 className="font-semibold text-sm text-indigo-700 mb-2">{PART_LABELS[pi]}</h3>
          <label className="block text-xs text-slate-500 mb-1">Asosiy matn/savol</label>
          <input
            value={part.promptText}
            onChange={(e) => updatePart(pi, { promptText: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm mb-3"
          />
          <label className="block text-xs text-slate-500 mb-1">
            {pi === 1 ? "Cue card bandlari" : "Qo'shimcha savollar"}
          </label>
          <div className="space-y-2">
            {part.followUps.map((f, fi) => (
              <div key={fi} className="flex gap-2">
                <input
                  value={f}
                  onChange={(e) => updateFollowUp(pi, fi, e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeFollowUp(pi, fi)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  O&apos;chirish
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addFollowUp(pi)}
            className="mt-2 text-sm text-indigo-600 font-medium hover:text-indigo-700"
          >
            + Qator qo&apos;shish
          </button>
        </div>
      ))}

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
