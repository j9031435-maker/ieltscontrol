import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteSpeakingSet } from "@/lib/actions/adminSpeaking";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminSpeakingListPage() {
  const sets = await prisma.speakingTask.findMany({
    where: { part: 1 },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Speaking to&apos;plamlari</h1>
        <Link
          href="/admin/speaking/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Yangi to&apos;plam
        </Link>
      </div>
      <div className="space-y-3">
        {sets.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <h2 className="font-semibold">{s.title}</h2>
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/speaking/${encodeURIComponent(s.title)}/edit`}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                Tahrirlash
              </Link>
              <DeleteButton
                action={deleteSpeakingSet.bind(null, s.title)}
                confirmText={`"${s.title}" to'plamini o'chirishni tasdiqlaysizmi?`}
              />
            </div>
          </div>
        ))}
        {sets.length === 0 && (
          <p className="text-sm text-slate-500">Hali to&apos;plam qo&apos;shilmagan.</p>
        )}
      </div>
    </div>
  );
}
