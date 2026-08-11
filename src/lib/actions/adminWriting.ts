"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { WritingTaskType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { parseChartSpec } from "@/lib/chartSpec";

export interface WritingTaskInput {
  title: string;
  taskType: WritingTaskType;
  minWords: number;
  prompt: string;
  chartData: string; // JSON ChartSpec for Task 1; empty string means no chart
}

function toWritingData(data: WritingTaskInput) {
  return {
    title: data.title,
    taskType: data.taskType,
    minWords: data.minWords,
    prompt: data.prompt,
    chartData: data.chartData.trim() || null,
  };
}

export async function createWritingTask(
  data: WritingTaskInput
): Promise<{ error?: string } | void> {
  await requireAdmin();
  const invalid = validateChartData(data);
  if (invalid) return { error: invalid };
  await prisma.writingTask.create({ data: toWritingData(data) });
  revalidatePath("/admin/writing");
  redirect("/admin/writing");
}

export async function updateWritingTask(
  id: string,
  data: WritingTaskInput
): Promise<{ error?: string } | void> {
  await requireAdmin();
  const invalid = validateChartData(data);
  if (invalid) return { error: invalid };
  await prisma.writingTask.update({ where: { id }, data: toWritingData(data) });
  revalidatePath("/admin/writing");
  redirect("/admin/writing");
}

function validateChartData(data: WritingTaskInput): string | null {
  if (!data.chartData.trim()) return null;
  if (!parseChartSpec(data.chartData)) {
    return "Diagramma ma'lumoti (JSON) noto'g'ri formatda. Namunadagi tuzilishga rioya qiling.";
  }
  return null;
}

export async function deleteWritingTask(id: string) {
  await requireAdmin();
  await prisma.writingTask.delete({ where: { id } });
  revalidatePath("/admin/writing");
}
