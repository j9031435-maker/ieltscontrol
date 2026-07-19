import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TestForm, { type TestFormInitial } from "@/components/admin/TestForm";

export default async function EditReadingTestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!test || test.section !== "READING") notFound();

  const initial: TestFormInitial = {
    title: test.title,
    description: test.description ?? "",
    bodyText: test.bodyText,
    questions: test.questions.map((q) => ({
      type: q.type,
      promptText: q.promptText,
      options: q.options ? (JSON.parse(q.options) as string[]).join(", ") : "",
      correctAnswer: q.correctAnswer,
    })),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Testni tahrirlash</h1>
      <TestForm section="READING" testId={test.id} initial={initial} />
    </div>
  );
}
