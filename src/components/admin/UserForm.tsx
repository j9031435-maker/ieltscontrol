"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { createUser, updateUser } from "@/lib/actions/adminUsers";

export default function UserForm({
  userId,
  isSelf,
  initial,
}: {
  userId?: string;
  isSelf?: boolean;
  initial?: { name: string; email: string; role: Role };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<Role>(initial?.role ?? "USER");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || (!userId && !email.trim())) {
      setError("Ism va email kiritilishi kerak.");
      return;
    }
    if (!userId && password.length < 6) {
      setError("Parol kamida 6 belgidan iborat bo'lishi kerak.");
      return;
    }
    if (userId && password && password.length < 6) {
      setError("Yangi parol kamida 6 belgidan iborat bo'lishi kerak.");
      return;
    }
    setSubmitting(true);
    try {
      const result = userId
        ? await updateUser(userId, { name, role, password: password || undefined })
        : await createUser({ name, email, password, role });
      if (result?.error) {
        setError(result.error);
        setSubmitting(false);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setError("Saqlashda xatolik yuz berdi.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Ism</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!!userId}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          {userId
            ? "Yangi parol (o'zgartirish uchun to'ldiring, aks holda bo'sh qoldiring)"
            : "Parol"}
        </label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Rol</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          disabled={!!isSelf}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        {isSelf && (
          <p className="mt-1 text-xs text-slate-500">
            O&apos;zingizning rolingizni bu yerdan o&apos;zgartira olmaysiz.
          </p>
        )}
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
