"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { getGeminiJsonModel } from "@/lib/gemini";
import {
  READING_GEN_PROMPT,
  LISTENING_GEN_PROMPT,
  WRITING_GEN_PROMPT,
  SPEAKING_GEN_PROMPT,
  parseTestSet,
  parseWritingSet,
  parseSpeakingSet,
  type TestContent,
} from "@/lib/scoring/contentGeneration";
import { REGENERATE_CONFIRM_PHRASE } from "@/lib/constants";

function questionCreateData(questions: TestContent["questions"]) {
  return questions.map((q, i) => ({
    order: i + 1,
    type: q.type,
    promptText: q.promptText,
    options: q.type === "MCQ" && q.options ? JSON.stringify(q.options) : null,
    correctAnswer: q.correctAnswer,
  }));
}

export async function regenerateAllContent(
  confirmPhrase: string
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();

  if (confirmPhrase !== REGENERATE_CONFIRM_PHRASE) {
    return { error: `Tasdiqlash matni noto'g'ri. Aynan "${REGENERATE_CONFIRM_PHRASE}" deb yozing.` };
  }
  if (!process.env.GEMINI_API_KEY) {
    return { error: "GEMINI_API_KEY sozlanmagan. .env faylga API kalitingizni qo'shing." };
  }

  let readingSet, listeningSet, writingSet, speakingSet;
  try {
    const [readingRes, listeningRes, writingRes, speakingRes] = await Promise.all([
      getGeminiJsonModel(READING_GEN_PROMPT).generateContent("Generate the 2 reading tests now."),
      getGeminiJsonModel(LISTENING_GEN_PROMPT).generateContent(
        "Generate the 2 listening tests now."
      ),
      getGeminiJsonModel(WRITING_GEN_PROMPT).generateContent("Generate the 3 writing tasks now."),
      getGeminiJsonModel(SPEAKING_GEN_PROMPT).generateContent("Generate the 2 speaking sets now."),
    ]);
    readingSet = parseTestSet(readingRes.response.text());
    listeningSet = parseTestSet(listeningRes.response.text());
    writingSet = parseWritingSet(writingRes.response.text());
    speakingSet = parseSpeakingSet(speakingRes.response.text());
  } catch (err) {
    console.error("Content regeneration failed:", err);
    return {
      error:
        "AI yangi testlarni yaratishda xatolik yuz berdi. Hech narsa o'zgartirilmadi, qayta urinib ko'ring.",
    };
  }

  try {
    await prisma.$transaction([
      prisma.attempt.deleteMany({}),
      prisma.test.deleteMany({}),
      prisma.writingTask.deleteMany({}),
      prisma.speakingTask.deleteMany({}),
      ...readingSet.tests.map((t) =>
        prisma.test.create({
          data: {
            section: "READING",
            title: t.title,
            description: t.description,
            bodyText: t.bodyText,
            questions: { create: questionCreateData(t.questions) },
          },
        })
      ),
      ...listeningSet.tests.map((t) =>
        prisma.test.create({
          data: {
            section: "LISTENING",
            title: t.title,
            description: t.description,
            bodyText: t.bodyText,
            questions: { create: questionCreateData(t.questions) },
          },
        })
      ),
      ...writingSet.tasks.map((t) =>
        prisma.writingTask.create({
          data: { title: t.title, taskType: t.taskType, minWords: t.minWords, prompt: t.prompt },
        })
      ),
      ...speakingSet.sets.flatMap((s) => [
        prisma.speakingTask.create({
          data: {
            title: s.title,
            part: 1,
            promptText: s.part1.promptText,
            followUps: JSON.stringify(s.part1.followUps),
          },
        }),
        prisma.speakingTask.create({
          data: {
            title: s.title,
            part: 2,
            promptText: s.part2.promptText,
            followUps: JSON.stringify(s.part2.followUps),
          },
        }),
        prisma.speakingTask.create({
          data: {
            title: s.title,
            part: 3,
            promptText: s.part3.promptText,
            followUps: JSON.stringify(s.part3.followUps),
          },
        }),
      ]),
    ]);
  } catch (err) {
    console.error("Content replace transaction failed:", err);
    return { error: "Ma'lumotlar bazasini yangilashda xatolik yuz berdi." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/reading");
  revalidatePath("/admin/listening");
  revalidatePath("/admin/writing");
  revalidatePath("/admin/speaking");
  revalidatePath("/admin/users");
  revalidatePath("/reading");
  revalidatePath("/listening");
  revalidatePath("/writing");
  revalidatePath("/speaking");
  revalidatePath("/results");
  revalidatePath("/dashboard");

  return { success: true };
}
