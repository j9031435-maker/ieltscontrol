import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ListeningListPage() {
  const tests = await prisma.test.findMany({
    where: { section: "LISTENING" },
    orderBy: { createdAt: "asc" },
    include: { parts: { select: { _count: { select: { questions: true } } } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Listening testlari</h1>
      <p className="text-slate-600 mb-6">
        Yozuvni tinglang va savollarga javob bering. Mashq uchun yozuvni istalgancha
        marta tinglashingiz mumkin.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {tests.map((t) => {
          const questionCount = t.parts.reduce((acc, p) => acc + p._count.questions, 0);
          return (
            <Link
              key={t.id}
              href={`/listening/${t.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <h2 className="font-semibold">{t.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{t.description}</p>
              <p className="mt-2 text-xs font-medium text-indigo-600">
                {t.parts.length} ta bo&apos;lim · {questionCount} ta savol
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
