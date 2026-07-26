import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserResults, SECTIONS } from "@/lib/userResults";
import { generateCertificatePdf } from "@/lib/certificate";

const SECTION_LABELS: Record<(typeof SECTIONS)[number], string> = {
  READING: "Reading",
  LISTENING: "Listening",
  WRITING: "Writing",
  SPEAKING: "Speaking",
};

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q." }, { status: 403 });
  }

  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Foydalanuvchi topilmadi." }, { status: 404 });
  }

  const results = await getUserResults(userId);
  if (results.overallBand === null) {
    return NextResponse.json(
      { error: "Bu foydalanuvchi hali barcha 4 bo'limni topshirmagan." },
      { status: 400 }
    );
  }

  const sectionScores = SECTIONS.map((s) => ({
    label: SECTION_LABELS[s],
    value: results.latestBySection[s]!.bandScore,
  }));

  const certificateId = `IC-${user.id.slice(-8).toUpperCase()}`;

  const pdfBytes = await generateCertificatePdf({
    studentName: user.name,
    certificateId,
    sectionScores,
    overallBand: results.overallBand,
    issuedDate: new Date(),
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="IELTS_Control_Sertifikat_${user.name.replace(/\s+/g, "_")}.pdf"`,
    },
  });
}
