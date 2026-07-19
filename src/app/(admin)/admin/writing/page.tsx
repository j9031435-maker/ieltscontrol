import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteWritingTask } from "@/lib/actions/adminWriting";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminWritingListPage() {
  const tasks = await prisma.writingTask.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Writing vazifalari</h1>
        <Link
          href="/admin/writing/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Yangi vazifa
        </Link>
      </div>
      <div className="space-y-3">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <span className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5 mb-1">
                {t.taskType === "TASK1" ? "Task 1" : "Task 2"}
              </span>
              <h2 className="font-semibold">{t.title}</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/writing/${t.id}/edit`}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                Tahrirlash
              </Link>
              <DeleteButton
                action={deleteWritingTask.bind(null, t.id)}
                confirmText={`"${t.title}" vazifasini o'chirishni tasdiqlaysizmi?`}
              />
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-slate-500">Hali vazifa qo&apos;shilmagan.</p>
        )}
      </div>
    </div>
  );
}
