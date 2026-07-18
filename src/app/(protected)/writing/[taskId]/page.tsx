import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WritingRunner from "@/components/WritingRunner";

export default async function WritingTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = await prisma.writingTask.findUnique({ where: { id: taskId } });
  if (!task) notFound();

  return (
    <div>
      <span className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5 mb-2">
        {task.taskType === "TASK1" ? "Task 1" : "Task 2"}
      </span>
      <h1 className="text-2xl font-bold mb-4">{task.title}</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 whitespace-pre-line text-sm leading-relaxed text-slate-800">
        {task.prompt}
      </div>
      <WritingRunner taskId={task.id} minWords={task.minWords} />
    </div>
  );
}
