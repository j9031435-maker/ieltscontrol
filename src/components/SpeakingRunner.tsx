"use client";

import { useState } from "react";
import RecordingButton from "./RecordingButton";
import FeedbackPanel from "./FeedbackPanel";

export interface SpeakingPart {
  id: string;
  part: number;
  promptText: string;
  followUps: string[];
}

interface SpeakingEvaluation {
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  overallBand: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  feedback: string;
}

const PART_LABELS: Record<number, string> = {
  1: "Part 1 — Kirish savollari",
  2: "Part 2 — Cue Card",
  3: "Part 3 — Muhokama",
};

export default function SpeakingRunner({
  setId,
  setTitle,
  parts,
}: {
  setId: string;
  setTitle: string;
  parts: SpeakingPart[];
}) {
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SpeakingEvaluation | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const payload = {
      setId,
      setTitle,
      parts: parts.map((p) => ({
        part: p.part,
        promptText: p.promptText,
        transcript: transcripts[p.id] ?? "",
      })),
    };
    const res = await fetch("/api/speaking/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
            { label: "Fluency & Coherence", value: result.fluencyCoherence },
            { label: "Lexical Resource", value: result.lexicalResource },
            { label: "Grammatical Range", value: result.grammaticalRange },
            { label: "Pronunciation", value: result.pronunciation },
          ]}
          strengths={result.strengths}
          weaknesses={result.weaknesses}
          suggestions={result.suggestions}
          feedback={result.feedback}
          note="Talaffuz (Pronunciation) bahosi faqat matn transkripti asosida taxminiy hisoblangan — haqiqiy talaffuzni faqat ovozni eshitgan inson yoki maxsus audio tahlil aniq baholay oladi."
        />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {parts.map((p) => (
        <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-sm text-indigo-700 mb-2">
            {PART_LABELS[p.part] ?? `Part ${p.part}`}
          </h3>
          <p className="font-medium mb-2">{p.promptText}</p>
          {p.followUps.length > 0 && (
            <ul className="list-disc list-inside text-sm text-slate-600 mb-3 space-y-0.5">
              {p.followUps.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}
          <RecordingButton
            value={transcripts[p.id] ?? ""}
            onChange={(text) => setTranscripts((t) => ({ ...t, [p.id]: text }))}
          />
        </div>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? "AI baholamoqda..." : "Baholash uchun yuborish"}
      </button>
    </div>
  );
}
