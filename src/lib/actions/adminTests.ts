"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Section, QuestionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export interface QuestionInput {
  type: QuestionType;
  promptText: string;
  options: string; // comma-separated, only meaningful for MCQ
  correctAnswer: string;
}

export interface PartInput {
  title: string;
  bodyText: string;
  questions: QuestionInput[];
}

export interface TestInput {
  title: string;
  description: string;
  parts: PartInput[];
}

function sectionPath(section: Section) {
  return section === "READING" ? "/admin/reading" : "/admin/listening";
}

function toPartCreateData(parts: PartInput[]) {
  return parts.map((p, pi) => ({
    part: pi + 1,
    title: p.title.trim() || null,
    bodyText: p.bodyText,
    questions: {
      create: p.questions.map((q, qi) => ({
        order: qi + 1,
        type: q.type,
        promptText: q.promptText,
        options:
          q.type === "MCQ"
            ? JSON.stringify(
                q.options
                  .split(",")
                  .map((o) => o.trim())
                  .filter(Boolean)
              )
            : null,
        correctAnswer: q.correctAnswer,
      })),
    },
  }));
}

export async function createTest(section: Section, data: TestInput) {
  await requireAdmin();

  await prisma.test.create({
    data: {
      section,
      title: data.title,
      description: data.description || null,
      parts: { create: toPartCreateData(data.parts) },
    },
  });

  revalidatePath(sectionPath(section));
  redirect(sectionPath(section));
}

export async function updateTest(testId: string, section: Section, data: TestInput) {
  await requireAdmin();

  // Parts are replaced wholesale; deleting them cascades to their questions.
  await prisma.test.update({
    where: { id: testId },
    data: {
      title: data.title,
      description: data.description || null,
      parts: {
        deleteMany: {},
        create: toPartCreateData(data.parts),
      },
    },
  });

  revalidatePath(sectionPath(section));
  redirect(sectionPath(section));
}

export async function deleteTest(testId: string, section: Section) {
  await requireAdmin();
  await prisma.test.delete({ where: { id: testId } });
  revalidatePath(sectionPath(section));
}
