"use client";

import { useEffect, useState } from "react";

export default function AudioPlayer({ script }: { script: string }) {
  const [playing, setPlaying] = useState(false);
  const [supported] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (!supported) return;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  function play() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.onend = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  }

  function stop() {
    window.speechSynthesis.cancel();
    setPlaying(false);
  }

  if (!supported) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Brauzeringiz ovozli o&apos;qishni (Text-to-Speech) qo&apos;llab-quvvatlamaydi. Iltimos,
        matnni o&apos;qing:
        <p className="mt-2 whitespace-pre-line text-slate-700">{script}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={playing ? stop : play}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {playing ? "To'xtatish" : "Tinglash"}
        </button>
        <button
          type="button"
          onClick={() => setShowTranscript((s) => !s)}
          className="text-sm text-slate-600 underline"
        >
          {showTranscript ? "Matnni yashirish" : "Matnni ko'rsatish"}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Brauzer ovozi orqali o&apos;qib eshittiriladi (real imtihonda faqat bir marta
        eshitiladi, lekin mashq uchun qayta tinglashingiz mumkin).
      </p>
      {showTranscript && (
        <p className="mt-3 whitespace-pre-line text-sm text-slate-700 border-t border-slate-100 pt-3">
          {script}
        </p>
      )}
    </div>
  );
}
