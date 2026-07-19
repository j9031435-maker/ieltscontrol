import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SpeakingSetForm from "@/components/admin/SpeakingSetForm";

export default async function EditSpeakingSetPage({
  params,
}: {
  params: Promise<{ title: string }>;
}) {
  const { title: encodedTitle } = await params;
  const title = decodeURIComponent(encodedTitle);
  const parts = await prisma.speakingTask.findMany({ where: { title }, orderBy: { part: "asc" } });
  if (parts.length === 0) notFound();

  const byPart = new Map(parts.map((p) => [p.part, p]));
  function toInput(part: number) {
    const p = byPart.get(part);
    return {
      promptText: p?.promptText ?? "",
      followUps: p?.followUps ? (JSON.parse(p.followUps) as string[]) : [""],
    };
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">To&apos;plamni tahrirlash</h1>
      <SpeakingSetForm
        originalTitle={title}
        initial={{ title, part1: toInput(1), part2: toInput(2), part3: toInput(3) }}
      />
    </div>
  );
}
