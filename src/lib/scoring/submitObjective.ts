import { NextResponse } from "next/server";
import type { Section } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gradeTest } from "./objective";
import { rawScoreToBand } from "./bandConversion";

export async function handleObjectiveSubmit(req: Request, section: Section) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Tizimga kiring." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const testId = body?.testId;
  const answers = body?.answers;
  if (typeof testId !== "string" || typeof answers !== "object" || answers === null) {
    return NextResponse.json({ error: "Noto'g'ri so'rov." }, { status: 400 });
  }

  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!test || test.section !== section) {
    return NextResponse.json({ error: "Test topilmadi." }, { status: 404 });
  }

  const { details, rawScore, total } = gradeTest(test.questions, answers);
  const bandScore = rawScoreToBand(rawScore, total);

  await prisma.attempt.create({
    data: {
      userId: session.user.id,
      section,
      refId: test.id,
      refTitle: test.title,
      answers: JSON.stringify(answers),
      rawScore,
      totalScore: total,
      bandScore,
    },
  });

  return NextResponse.json({ rawScore, total, bandScore, details });
}
