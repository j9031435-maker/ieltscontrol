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

export interface TestInput {
  title: string;
  description: string;
  bodyText: string;
  questions: QuestionInput[];
}

function sectionPath(section: Section) {
  return section === "READING" ? "/admin/reading" : "/admin/listening";
}

function toQuestionCreateData(questions: QuestionInput[]) {
  return questions.map((q, i) => ({
    order: i + 1,
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
  }));
}

export async function createTest(section: Section, data: TestInput) {
  await requireAdmin();

  await prisma.test.create({
    data: {
      section,
      title: data.title,
      description: data.description || null,
      bodyText: data.bodyText,
      questions: { create: toQuestionCreateData(data.questions) },
    },
  });

  revalidatePath(sectionPath(section));
  redirect(sectionPath(section));
}

export async function updateTest(testId: string, section: Section, data: TestInput) {
  await requireAdmin();

  await prisma.test.update({
    where: { id: testId },
    data: {
      title: data.title,
      description: data.description || null,
      bodyText: data.bodyText,
      questions: {
        deleteMany: {},
        create: toQuestionCreateData(data.questions),
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
