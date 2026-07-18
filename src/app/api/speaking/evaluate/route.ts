import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import {
  SPEAKING_SYSTEM_PROMPT,
  buildSpeakingUserPrompt,
  parseSpeakingEvaluation,
  type SpeakingEvaluation,
  type SpeakingPartTranscript,
} from "@/lib/scoring/speakingRubric";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Tizimga kiring." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const setId = body?.setId;
  const setTitle = body?.setTitle;
  const parts = body?.parts as SpeakingPartTranscript[] | undefined;

  if (
    typeof setId !== "string" ||
    typeof setTitle !== "string" ||
    !Array.isArray(parts) ||
    parts.length === 0
  ) {
    return NextResponse.json({ error: "Noto'g'ri so'rov." }, { status: 400 });
  }

  const totalWords = parts.reduce(
    (sum, p) => sum + (p.transcript?.trim().split(/\s+/).filter(Boolean).length ?? 0),
    0
  );
  if (totalWords < 15) {
    return NextResponse.json(
      { error: "Javob juda qisqa. Iltimos, savollarga to'liqroq javob bering." },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY sozlanmagan. .env faylga API kalitingizni qo'shing." },
      { status: 500 }
    );
  }

  let evaluation: SpeakingEvaluation;
  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      system: SPEAKING_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildSpeakingUserPrompt(setTitle, parts) }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("AI matnli javob qaytarmadi.");
    }
    evaluation = parseSpeakingEvaluation(textBlock.text);
  } catch (err) {
    console.error("Speaking evaluation failed:", err);
    return NextResponse.json(
      { error: "AI baholash amalga oshmadi. Keyinroq qayta urinib ko'ring." },
      { status: 502 }
    );
  }

  await prisma.attempt.create({
    data: {
      userId: session.user.id,
      section: "SPEAKING",
      refId: setId,
      refTitle: setTitle,
      answers: JSON.stringify({ parts }),
      bandScore: evaluation.overallBand,
      aiCriteria: JSON.stringify({
        fluencyCoherence: evaluation.fluencyCoherence,
        lexicalResource: evaluation.lexicalResource,
        grammaticalRange: evaluation.grammaticalRange,
        pronunciation: evaluation.pronunciation,
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
