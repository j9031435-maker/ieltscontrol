"use client";

import { useEffect, useRef, useState } from "react";

export default function RecordingButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [supported] = useState(
    () => typeof window !== "undefined" && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition)
  );
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseTextRef = useRef("");
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!supported) return;
    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalText += transcript + " ";
        } else {
          interimText += transcript;
        }
      }
      if (finalText) {
        baseTextRef.current = (baseTextRef.current + " " + finalText).trim();
      }
      onChangeRef.current((baseTextRef.current + " " + interimText).trim());
    };
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
    };
  }, [supported]);

  function start() {
    baseTextRef.current = value ? value + " " : "";
    recognitionRef.current?.start();
    setRecording(true);
  }

  function stop() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  if (!supported) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        Brauzeringiz ovozni matnga aylantirishni (Speech Recognition) qo&apos;llab-quvvatlamaydi.
        Iltimos, Google Chrome brauzeridan foydalaning yoki javobingizni qo&apos;lda kiriting.
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={recording ? stop : start}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            recording
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {recording ? "To'xtatish" : "Gapirishni boshlash"}
        </button>
        {recording && (
          <span className="text-xs text-red-600 animate-pulse">● Yozib olinmoqda...</span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Sizning javobingiz shu yerda matn ko'rinishida paydo bo'ladi. Kerak bo'lsa qo'lda tahrirlashingiz mumkin."
        className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
