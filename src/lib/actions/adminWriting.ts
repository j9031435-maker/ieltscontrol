"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { WritingTaskType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export interface WritingTaskInput {
  title: string;
  taskType: WritingTaskType;
  minWords: number;
  prompt: string;
}

export async function createWritingTask(data: WritingTaskInput) {
  await requireAdmin();
  await prisma.writingTask.create({ data });
  revalidatePath("/admin/writing");
  redirect("/admin/writing");
}

export async function updateWritingTask(id: string, data: WritingTaskInput) {
  await requireAdmin();
  await prisma.writingTask.update({ where: { id }, data });
  revalidatePath("/admin/writing");
  redirect("/admin/writing");
}

export async function deleteWritingTask(id: string) {
  await requireAdmin();
  await prisma.writingTask.delete({ where: { id } });
  revalidatePath("/admin/writing");
}
