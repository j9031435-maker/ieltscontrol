"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export interface SpeakingPartInput {
  promptText: string;
  followUps: string[];
}

export interface SpeakingSetInput {
  title: string;
  part1: SpeakingPartInput;
  part2: SpeakingPartInput;
  part3: SpeakingPartInput;
}

export async function createSpeakingSet(data: SpeakingSetInput) {
  await requireAdmin();

  await prisma.speakingTask.createMany({
    data: [
      {
        title: data.title,
        part: 1,
        promptText: data.part1.promptText,
        followUps: JSON.stringify(data.part1.followUps),
      },
      {
        title: data.title,
        part: 2,
        promptText: data.part2.promptText,
        followUps: JSON.stringify(data.part2.followUps),
      },
      {
        title: data.title,
        part: 3,
        promptText: data.part3.promptText,
        followUps: JSON.stringify(data.part3.followUps),
      },
    ],
  });

  revalidatePath("/admin/speaking");
  redirect("/admin/speaking");
}

export async function updateSpeakingSet(originalTitle: string, data: SpeakingSetInput) {
  await requireAdmin();

  const existing = await prisma.speakingTask.findMany({ where: { title: originalTitle } });
  const byPart = new Map(existing.map((p) => [p.part, p]));
  const partData = [
    { part: 1, ...data.part1 },
    { part: 2, ...data.part2 },
    { part: 3, ...data.part3 },
  ];

  for (const p of partData) {
    const current = byPart.get(p.part);
    if (current) {
      await prisma.speakingTask.update({
        where: { id: current.id },
        data: {
          title: data.title,
          promptText: p.promptText,
          followUps: JSON.stringify(p.followUps),
        },
      });
    } else {
      await prisma.speakingTask.create({
        data: {
          title: data.title,
          part: p.part,
          promptText: p.promptText,
          followUps: JSON.stringify(p.followUps),
        },
      });
    }
  }

  revalidatePath("/admin/speaking");
  redirect("/admin/speaking");
}

export async function deleteSpeakingSet(title: string) {
  await requireAdmin();
  await prisma.speakingTask.deleteMany({ where: { title } });
  revalidatePath("/admin/speaking");
}
