import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function WritingListPage() {
  const tasks = await prisma.writingTask.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Writing vazifalari</h1>
      <p className="text-slate-600 mb-6">
        Javobingizni yozing — sun&apos;iy intellekt IELTS band-score mezonlari asosida
        baholaydi va fikr-mulohaza beradi.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {tasks.map((t) => (
          <Link
            key={t.id}
            href={`/writing/${t.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition"
          >
            <span className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5 mb-2">
              {t.taskType === "TASK1" ? "Task 1" : "Task 2"}
            </span>
            <h2 className="font-semibold">{t.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
