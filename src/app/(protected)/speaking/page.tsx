import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function SpeakingListPage() {
  const sets = await prisma.speakingTask.findMany({
    where: { part: 1 },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Speaking to&apos;plamlari</h1>
      <p className="text-slate-600 mb-6">
        Har bir to&apos;plam 3 qismdan iborat: Part 1, Part 2 (cue card), Part 3.
        Mikrofon orqali ovozli javob bering — brauzer uni matnga aylantiradi va AI
        tahlil qiladi.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {sets.map((s) => (
          <Link
            key={s.id}
            href={`/speaking/${s.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition"
          >
            <h2 className="font-semibold">{s.title}</h2>
            <p className="mt-1 text-sm text-slate-600">Part 1, 2, 3</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
