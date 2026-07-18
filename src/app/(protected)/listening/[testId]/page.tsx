import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TestRunner, { type ClientQuestion } from "@/components/TestRunner";
import AudioPlayer from "@/components/AudioPlayer";

export default async function ListeningTestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!test || test.section !== "LISTENING") notFound();

  const clientQuestions: ClientQuestion[] = test.questions.map((q) => ({
    id: q.id,
    order: q.order,
    type: q.type,
    promptText: q.promptText,
    options: q.options ? JSON.parse(q.options) : null,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{test.title}</h1>
      <AudioPlayer script={test.bodyText} />
      <TestRunner section="LISTENING" testId={test.id} questions={clientQuestions} />
    </div>
  );
}
