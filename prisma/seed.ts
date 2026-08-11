import { PrismaClient } from "@prisma/client";
import seedData from "./seedData.json";

const prisma = new PrismaClient();

type SeedQuestion = {
  type: "MCQ" | "TRUE_FALSE_NG" | "FILL_BLANK";
  promptText: string;
  options?: string[];
  correctAnswer: string;
};

type SeedPart = {
  title: string;
  bodyText: string;
  questions: SeedQuestion[];
};

function partCreateData(parts: SeedPart[]) {
  return parts.map((p, i) => ({
    part: i + 1,
    title: p.title,
    bodyText: p.bodyText,
    questions: {
      create: p.questions.map((q, qi) => ({
        order: qi + 1,
        type: q.type,
        promptText: q.promptText,
        options: q.type === "MCQ" && q.options ? JSON.stringify(q.options) : null,
        correctAnswer: q.correctAnswer,
      })),
    },
  }));
}

async function main() {
  // Content only — user accounts and their attempt history are left alone.
  await prisma.test.deleteMany();
  await prisma.writingTask.deleteMany();
  await prisma.speakingTask.deleteMany();

  const { readingParts, listeningParts, writing, speaking } = seedData as {
    readingParts: SeedPart[];
    listeningParts: SeedPart[];
    writing: {
      tasks: {
        title: string;
        taskType: "TASK1" | "TASK2";
        minWords: number;
        prompt: string;
        chart?: unknown;
      }[];
    };
    speaking: {
      sets: {
        title: string;
        part1: { promptText: string; followUps: string[] };
        part2: { promptText: string; followUps: string[] };
        part3: { promptText: string; followUps: string[] };
      }[];
    };
  };

  const readingCount = readingParts.reduce((acc, p) => acc + p.questions.length, 0);
  const listeningCount = listeningParts.reduce((acc, p) => acc + p.questions.length, 0);

  // One Test = one full exam paper, mirroring the real IELTS structure.
  await prisma.test.create({
    data: {
      section: "READING",
      title: "Academic Reading Test",
      description: `${readingParts.length} ta matn, ${readingCount} ta savol`,
      parts: { create: partCreateData(readingParts) },
    },
  });

  await prisma.test.create({
    data: {
      section: "LISTENING",
      title: "Listening Test",
      description: `${listeningParts.length} ta bo'lim, ${listeningCount} ta savol`,
      parts: { create: partCreateData(listeningParts) },
    },
  });

  for (const t of writing.tasks) {
    await prisma.writingTask.create({
      data: {
        title: t.title,
        taskType: t.taskType,
        minWords: t.minWords,
        prompt: t.prompt,
        chartData: t.chart ? JSON.stringify(t.chart) : null,
      },
    });
  }

  for (const s of speaking.sets) {
    for (const [i, p] of [s.part1, s.part2, s.part3].entries()) {
      await prisma.speakingTask.create({
        data: {
          title: s.title,
          part: i + 1,
          promptText: p.promptText,
          followUps: JSON.stringify(p.followUps),
        },
      });
    }
  }

  console.log(
    `Seeded: Reading ${readingParts.length} parts / ${readingCount} questions, ` +
      `Listening ${listeningParts.length} parts / ${listeningCount} questions, ` +
      `Writing ${writing.tasks.length} tasks, Speaking ${speaking.sets.length} sets.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
