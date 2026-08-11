import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { REGENERATE_CONFIRM_PHRASE } from "@/lib/constants";
import {
  generateAllContent,
  replaceAllContent,
  generationErrorMessage,
} from "@/lib/contentRegeneration";

// Generating four full papers takes well over the default limit.
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (body?.confirmPhrase !== REGENERATE_CONFIRM_PHRASE) {
    return NextResponse.json(
      { error: `Tasdiqlash matni noto'g'ri. Aynan "${REGENERATE_CONFIRM_PHRASE}" deb yozing.` },
      { status: 400 }
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY sozlanmagan. .env faylga API kalitingizni qo'shing." },
      { status: 500 }
    );
  }

  // Content is generated and validated before anything is deleted, so a
  // failed generation leaves the existing tests untouched.
  let content;
  try {
    content = await generateAllContent();
  } catch (err) {
    console.error("Content regeneration failed:", err);
    return NextResponse.json({ error: generationErrorMessage(err) }, { status: 502 });
  }

  try {
    await replaceAllContent(content);
  } catch (err) {
    console.error("Content replace transaction failed:", err);
    return NextResponse.json(
      { error: "Ma'lumotlar bazasini yangilashda xatolik yuz berdi." },
      { status: 500 }
    );
  }

  for (const path of [
    "/admin",
    "/admin/reading",
    "/admin/listening",
    "/admin/writing",
    "/admin/speaking",
    "/admin/users",
    "/reading",
    "/listening",
    "/writing",
    "/speaking",
    "/results",
    "/dashboard",
  ]) {
    revalidatePath(path);
  }

  return NextResponse.json({
    success: true,
    readingQuestions: content.readingParts.reduce((a, p) => a + p.questions.length, 0),
    listeningQuestions: content.listeningParts.reduce((a, p) => a + p.questions.length, 0),
  });
}
