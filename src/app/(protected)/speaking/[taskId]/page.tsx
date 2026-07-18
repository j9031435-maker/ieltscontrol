import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SpeakingRunner, { type SpeakingPart } from "@/components/SpeakingRunner";

export default async function SpeakingSetPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const anchor = await prisma.speakingTask.findUnique({ where: { id: taskId } });
  if (!anchor) notFound();

  const parts = await prisma.speakingTask.findMany({
    where: { title: anchor.title },
    orderBy: { part: "asc" },
  });

  const clientParts: SpeakingPart[] = parts.map((p) => ({
    id: p.id,
    part: p.part,
    promptText: p.promptText,
    followUps: p.followUps ? (JSON.parse(p.followUps) as string[]) : [],
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{anchor.title}</h1>
      <SpeakingRunner setId={anchor.id} setTitle={anchor.title} parts={clientParts} />
    </div>
  );
}
