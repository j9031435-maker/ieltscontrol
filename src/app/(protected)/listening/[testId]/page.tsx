import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TestRunner, { type ClientPart } from "@/components/TestRunner";

export default async function ListeningTestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      parts: {
        orderBy: { part: "asc" },
        include: { questions: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!test || test.section !== "LISTENING") notFound();

  const clientParts: ClientPart[] = test.parts.map((p) => ({
    id: p.id,
    part: p.part,
    title: p.title,
    bodyText: p.bodyText,
    questions: p.questions.map((q) => ({
      id: q.id,
      order: q.order,
      type: q.type,
      promptText: q.promptText,
      options: q.options ? JSON.parse(q.options) : null,
    })),
  }));

  const totalQuestions = clientParts.reduce((acc, p) => acc + p.questions.length, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{test.title}</h1>
      <p className="text-sm text-slate-600 mb-6">
        {clientParts.length} ta bo&apos;lim, jami {totalQuestions} ta savol. Har bo&apos;limni
        tinglab, savollarga javob bering va oxirida bir marta yuboring.
      </p>
      <TestRunner section="LISTENING" testId={test.id} parts={clientParts} />
    </div>
  );
}
