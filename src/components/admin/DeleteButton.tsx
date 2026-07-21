"use client";

import { useTransition } from "react";

export default function DeleteButton({
  action,
  confirmText = "O'chirishni tasdiqlaysizmi?",
}: {
  action: () => Promise<{ error?: string } | void>;
  confirmText?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(confirmText)) {
          startTransition(async () => {
            const result = await action();
            if (result?.error) alert(result.error);
          });
        }
      }}
      className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
    >
      {pending ? "O'chirilmoqda..." : "O'chirish"}
    </button>
  );
}
