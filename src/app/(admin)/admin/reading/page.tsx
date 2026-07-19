import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteTest } from "@/lib/actions/adminTests";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminReadingListPage() {
  const tests = await prisma.test.findMany({
    where: { section: "READING" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reading testlari</h1>
        <Link
          href="/admin/reading/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Yangi test
        </Link>
      </div>
      <div className="space-y-3">
        {tests.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <h2 className="font-semibold">{t.title}</h2>
              <p className="text-sm text-slate-500">{t._count.questions} ta savol</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/reading/${t.id}/edit`}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                Tahrirlash
              </Link>
              <DeleteButton
                action={deleteTest.bind(null, t.id, "READING")}
                confirmText={`"${t.title}" testini o'chirishni tasdiqlaysizmi?`}
              />
            </div>
          </div>
        ))}
        {tests.length === 0 && (
          <p className="text-sm text-slate-500">Hali test qo&apos;shilmagan.</p>
        )}
      </div>
    </div>
  );
}
