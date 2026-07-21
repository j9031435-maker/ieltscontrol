"use client";

import { useEffect, useRef, useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Mikrofonga ruxsat berilmadi. Brauzer manzil qatoridagi qulf belgisini bosib, mikrofonga ruxsat bering va qayta urinib ko'ring.",
  "no-speech": "Ovoz aniqlanmadi. Mikrofonga yaqinroq va balandroq gapirib ko'ring.",
  "audio-capture": "Mikrofon topilmadi. Qurilmangizga mikrofon ulanganini tekshiring.",
  "network": "Tarmoq xatosi yuz berdi. Internet aloqasini tekshirib, qayta urinib ko'ring.",
  "service-not-allowed": "Ovoz tanish xizmati bloklangan. Boshqa brauzer yoki tarmoqda urinib ko'ring.",
};

export default function RecordingButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported] = useState(
    () => typeof window !== "undefined" && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition)
  );
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseTextRef = useRef("");
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function start() {
    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    setError(null);
    // A fresh instance per start() is more reliable than reusing one across
    // multiple start/stop cycles — Chrome's implementation can get stuck in
    // an unusable state if the same instance is restarted.
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    baseTextRef.current = valueRef.current ? valueRef.current + " " : "";

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

    recognition.onerror = (event) => {
      const code = event.error;
      if (code && code !== "aborted") {
        setError(ERROR_MESSAGES[code] ?? `Xatolik yuz berdi: ${code}`);
      }
      setRecording(false);
    };

    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setRecording(true);
    } catch {
      setError("Yozib olishni boshlab bo'lmadi. Sahifani yangilab qayta urinib ko'ring.");
      setRecording(false);
    }
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
      {error && (
        <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
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
