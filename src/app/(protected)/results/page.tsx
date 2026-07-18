import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BandScoreCard from "@/components/BandScoreCard";
import { computeOverallBand } from "@/lib/scoring/bandConversion";
import type { Attempt, Section } from "@prisma/client";

const SECTION_LABELS: Record<Section, string> = {
  READING: "Reading",
  LISTENING: "Listening",
  WRITING: "Writing",
  SPEAKING: "Speaking",
};

const SECTIONS: Section[] = ["READING", "LISTENING", "WRITING", "SPEAKING"];

export default async function ResultsPage() {
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

  const latestBands = SECTIONS.map((s) => latestBySection[s]?.bandScore).filter(
    (b): b is number => typeof b === "number"
  );
  const overallBand = latestBands.length === 4 ? computeOverallBand(latestBands) : null;

  const dateFormatter = new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Natijalar</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {SECTIONS.map((s) => {
          const a = latestBySection[s];
          return (
            <div key={s} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-medium text-slate-500 mb-2">{SECTION_LABELS[s]}</h3>
              {a ? (
                <>
                  <div className="text-2xl font-bold text-indigo-700">
                    {a.bandScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">{a.refTitle}</div>
                </>
              ) : (
                <div className="text-sm text-slate-400">Hali test topshirilmagan</div>
              )}
            </div>
          );
        })}
      </div>

      {overallBand !== null ? (
        <div className="mb-8">
          <BandScoreCard band={overallBand} label="Taxminiy umumiy band (4 bo'lim o'rtachasi)" />
        </div>
      ) : (
        <p className="mb-8 text-sm text-slate-500">
          Umumiy taxminiy bandni ko&apos;rish uchun barcha 4 bo&apos;limdan kamida bittadan test
          topshiring.
        </p>
      )}

      <h2 className="text-lg font-semibold mb-3">Urinishlar tarixi</h2>
      {attempts.length === 0 ? (
        <p className="text-sm text-slate-500">Hali hech qanday test topshirilmagan.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Sana</th>
                <th className="px-4 py-2 font-medium">Bo&apos;lim</th>
                <th className="px-4 py-2 font-medium">Test</th>
                <th className="px-4 py-2 font-medium">Band</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-500 whitespace-nowrap">
                    {dateFormatter.format(a.createdAt)}
                  </td>
                  <td className="px-4 py-2">{SECTION_LABELS[a.section]}</td>
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
