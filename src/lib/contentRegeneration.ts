import { prisma } from "@/lib/prisma";
import { getGeminiJsonModel, isQuotaError } from "@/lib/gemini";
import {
  READING_GEN_PROMPT,
  LISTENING_GEN_PROMPT,
  WRITING_GEN_PROMPT,
  SPEAKING_GEN_PROMPT,
  parseReadingPaper,
  parseListeningPaper,
  parseWritingSet,
  parseSpeakingSet,
  type PartContent,
} from "@/lib/scoring/contentGeneration";

// Long papers hold several passages plus their questions in one response.
const BULK_TOKENS = 32768;

function questionCreateData(questions: PartContent["questions"]) {
  return questions.map((q, i) => ({
    order: i + 1,
    type: q.type,
    promptText: q.promptText,
    options: q.type === "MCQ" && q.options ? JSON.stringify(q.options) : null,
    correctAnswer: q.correctAnswer,
  }));
}

function partCreateData(parts: PartContent[]) {
  return parts.map((p, i) => ({
    part: i + 1,
    title: p.title,
    bodyText: p.bodyText,
    questions: { create: questionCreateData(p.questions) },
  }));
}

export interface GeneratedContent {
  readingParts: PartContent[];
  listeningParts: PartContent[];
  writing: Awaited<ReturnType<typeof parseWritingSet>>;
  speaking: Awaited<ReturnType<typeof parseSpeakingSet>>;
}

/**
 * Exactly four Gemini calls — the free tier caps at 5 requests per minute, so
 * generating each passage separately would immediately trip a 429.
 */
export async function generateAllContent(): Promise<GeneratedContent> {
  const [readingRes, listeningRes, writingRes, speakingRes] = await Promise.all([
    getGeminiJsonModel(READING_GEN_PROMPT, BULK_TOKENS).generateContent(
      "Write the complete 3-passage reading paper now."
    ),
    getGeminiJsonModel(LISTENING_GEN_PROMPT, BULK_TOKENS).generateContent(
      "Write the complete 4-section listening paper now."
    ),
    getGeminiJsonModel(WRITING_GEN_PROMPT).generateContent("Generate the 2 writing tasks now."),
    getGeminiJsonModel(SPEAKING_GEN_PROMPT).generateContent("Generate the 2 speaking sets now."),
  ]);

  return {
    readingParts: parseReadingPaper(readingRes.response.text()),
    listeningParts: parseListeningPaper(listeningRes.response.text()),
    writing: parseWritingSet(writingRes.response.text()),
    speaking: parseSpeakingSet(speakingRes.response.text()),
  };
}

/** Replaces all test content and wipes attempt history, atomically. */
export async function replaceAllContent(content: GeneratedContent) {
  const { readingParts, listeningParts, writing, speaking } = content;
  const readingCount = readingParts.reduce((acc, p) => acc + p.questions.length, 0);
  const listeningCount = listeningParts.reduce((acc, p) => acc + p.questions.length, 0);

  await prisma.$transaction([
    prisma.attempt.deleteMany({}),
    prisma.test.deleteMany({}),
    prisma.writingTask.deleteMany({}),
    prisma.speakingTask.deleteMany({}),
    prisma.test.create({
      data: {
        section: "READING",
        title: "Academic Reading Test",
        description: `${readingParts.length} ta matn, ${readingCount} ta savol`,
        parts: { create: partCreateData(readingParts) },
      },
    }),
    prisma.test.create({
      data: {
        section: "LISTENING",
        title: "Listening Test",
        description: `${listeningParts.length} ta bo'lim, ${listeningCount} ta savol`,
        parts: { create: partCreateData(listeningParts) },
      },
    }),
    ...writing.tasks.map((t) =>
      prisma.writingTask.create({
        data: {
          title: t.title,
          taskType: t.taskType,
          minWords: t.minWords,
          prompt: t.prompt,
          chartData: t.chart ? JSON.stringify(t.chart) : null,
        },
      })
    ),
    ...speaking.sets.flatMap((s) =>
      [s.part1, s.part2, s.part3].map((p, i) =>
        prisma.speakingTask.create({
          data: {
            title: s.title,
            part: i + 1,
            promptText: p.promptText,
            followUps: JSON.stringify(p.followUps),
          },
        })
      )
    ),
  ]);
}

export function generationErrorMessage(err: unknown): string {
  if (isQuotaError(err)) {
    return "Gemini bepul rejasining limitiga yetdingiz (daqiqasiga 5 ta so'rov). Bir daqiqa kutib, qayta urinib ko'ring. Hech narsa o'zgartirilmadi.";
  }
  return "AI yangi testlarni yaratishda xatolik yuz berdi. Hech narsa o'zgartirilmadi, qayta urinib ko'ring.";
}
