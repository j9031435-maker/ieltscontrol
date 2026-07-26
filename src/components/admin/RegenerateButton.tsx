"use client";

import { useState } from "react";
import { regenerateAllContent } from "@/lib/actions/adminRegenerate";
import { REGENERATE_CONFIRM_PHRASE } from "@/lib/constants";

export default function RegenerateButton() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleConfirm() {
    setError(null);
    setLoading(true);
    const result = await regenerateAllContent(confirmText);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setOpen(false);
    setConfirmText("");
  }

  return (
    <div>
      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setSuccess(false);
            setError(null);
          }}
          className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700"
        >
          Barcha testlarni AI bilan tubdan yangilash
        </button>
      )}

      {open && (
        <div className="bg-white border border-red-300 rounded-lg p-4">
          <p className="text-sm text-slate-700 mb-2">
            Tasdiqlash uchun quyidagi maydonga aynan{" "}
            <strong className="font-mono">{REGENERATE_CONFIRM_PHRASE}</strong> deb yozing:
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-3 font-mono"
            placeholder={REGENERATE_CONFIRM_PHRASE}
            disabled={loading}
          />
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirmText !== REGENERATE_CONFIRM_PHRASE || loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {loading
                ? "AI testlar yaratmoqda... (bir necha soniya)"
                : "Ha, hammasini o'chirib, yangisini yarat"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirmText("");
                setError(null);
              }}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 hover:bg-slate-50"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {success && (
        <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Muvaffaqiyatli yangilandi! Barcha testlar yangi kontent bilan almashtirildi va eski
          natijalar o&apos;chirildi.
        </p>
      )}
    </div>
  );
}
