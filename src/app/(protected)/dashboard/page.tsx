import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BandScoreCard from "@/components/BandScoreCard";
import { computeOverallBand } from "@/lib/scoring/bandConversion";
import type { Attempt, Section } from "@prisma/client";

const SECTIONS: { key: Section; href: string; label: string; desc: string }[] = [
  { key: "READING", href: "/reading", label: "Reading", desc: "Matnni o'qing va savollarga javob bering" },
  { key: "LISTENING", href: "/listening", label: "Listening", desc: "Audio yozuvni tinglang va javob bering" },
  { key: "WRITING", href: "/writing", label: "Writing", desc: "Insho yozing, AI band-score bo'yicha baholaydi" },
  { key: "SPEAKING", href: "/speaking", label: "Speaking", desc: "Ovozli javob bering, AI nutqingizni tahlil qiladi" },
];

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const attempts = await prisma.attempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const latestBySection: Partial<Record<Section, Attempt>> = {};
  for (const a of attempts) {
    if (!latestBySection[a.section]) latestBySection[a.section] = a;
  }

  const latestBands = SECTIONS.map((s) => latestBySection[s.key]?.bandScore).filter(
    (b): b is number => typeof b === "number"
  );
  const overallBand = latestBands.length === 4 ? computeOverallBand(latestBands) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">
        Xush kelibsiz, {session?.user?.name}!
      </h1>
      <p className="text-slate-600 mb-6">
        IELTS imtihoniga tayyorgarlik ko&apos;rish uchun quyidagi bo&apos;limlardan birini
        tanlang.
      </p>

      {overallBand !== null && (
        <div className="mb-8">
          <BandScoreCard band={overallBand} label="Taxminiy umumiy band" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {SECTIONS.map((s) => {
          const a = latestBySection[s.key];
          return (
            <Link
              key={s.key}
              href={s.href}
              className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <h3 className="font-semibold">{s.label}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
              <div className="mt-3 text-sm">
                {a ? (
                  <span className="font-medium text-indigo-700">
                    Oxirgi band: {a.bandScore.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-slate-400">Hali topshirilmagan</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">So&apos;nggi urinishlar</h2>
        <Link href="/results" className="text-sm text-indigo-600 font-medium">
          Barchasini ko&apos;rish
        </Link>
      </div>
      {attempts.length === 0 ? (
        <p className="text-sm text-slate-500">Hali hech qanday test topshirilmagan.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Bo&apos;lim</th>
                <th className="px-4 py-2 font-medium">Test</th>
                <th className="px-4 py-2 font-medium">Band</th>
              </tr>
            </thead>
            <tbody>
              {attempts.slice(0, 5).map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{SECTIONS.find((s) => s.key === a.section)?.label}</td>
                  <td className="px-4 py-2">{a.refTitle}</td>
                  <td className="px-4 py-2 font-medium">{a.bandScore.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
