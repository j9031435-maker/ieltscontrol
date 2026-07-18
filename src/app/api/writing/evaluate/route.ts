import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import {
  WRITING_SYSTEM_PROMPT,
  buildWritingUserPrompt,
  parseWritingEvaluation,
  type WritingEvaluation,
} from "@/lib/scoring/writingRubric";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Tizimga kiring." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const taskId = body?.taskId;
  const responseText = body?.responseText;
  if (
    typeof taskId !== "string" ||
    typeof responseText !== "string" ||
    responseText.trim().split(/\s+/).length < 20
  ) {
    return NextResponse.json(
      { error: "Javob juda qisqa yoki so'rov noto'g'ri." },
      { status: 400 }
    );
  }

  const task = await prisma.writingTask.findUnique({ where: { id: taskId } });
  if (!task) {
    return NextResponse.json({ error: "Vazifa topilmadi." }, { status: 404 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY sozlanmagan. .env faylga API kalitingizni qo'shing." },
      { status: 500 }
    );
  }

  let evaluation: WritingEvaluation;
  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      system: WRITING_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildWritingUserPrompt(task.taskType, task.prompt, task.minWords, responseText),
        },
      ],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("AI matnli javob qaytarmadi.");
    }
    evaluation = parseWritingEvaluation(textBlock.text);
  } catch (err) {
    console.error("Writing evaluation failed:", err);
    return NextResponse.json(
      { error: "AI baholash amalga oshmadi. Keyinroq qayta urinib ko'ring." },
      { status: 502 }
    );
  }

  await prisma.attempt.create({
    data: {
      userId: session.user.id,
      section: "WRITING",
      refId: task.id,
      refTitle: task.title,
      answers: JSON.stringify({ responseText }),
      bandScore: evaluation.overallBand,
      aiCriteria: JSON.stringify({
        taskAchievement: evaluation.taskAchievement,
        coherenceCohesion: evaluation.coherenceCohesion,
        lexicalResource: evaluation.lexicalResource,
        grammaticalRange: evaluation.grammaticalRange,
      }),
      aiFeedback: JSON.stringify({
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        suggestions: evaluation.suggestions,
        feedback: evaluation.feedback,
      }),
    },
  });

  return NextResponse.json(evaluation);
}
