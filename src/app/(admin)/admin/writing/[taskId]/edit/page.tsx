import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WritingTaskForm from "@/components/admin/WritingTaskForm";

export default async function EditWritingTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = await prisma.writingTask.findUnique({ where: { id: taskId } });
  if (!task) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Vazifani tahrirlash</h1>
      <WritingTaskForm
        taskId={task.id}
        initial={{
          title: task.title,
          taskType: task.taskType,
          minWords: task.minWords,
          prompt: task.prompt,
        }}
      />
    </div>
  );
}
