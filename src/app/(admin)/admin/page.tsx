import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const [readingCount, listeningCount, writingCount, speakingCount, newsCount, userCount] =
    await Promise.all([
      prisma.test.count({ where: { section: "READING" } }),
      prisma.test.count({ where: { section: "LISTENING" } }),
      prisma.writingTask.count(),
      prisma.speakingTask.count({ where: { part: 1 } }),
      prisma.newsPost.count(),
      prisma.user.count(),
    ]);

  const cards = [
    { href: "/admin/reading", label: "Reading testlari", count: readingCount },
    { href: "/admin/listening", label: "Listening testlari", count: listeningCount },
    { href: "/admin/writing", label: "Writing vazifalari", count: writingCount },
    { href: "/admin/speaking", label: "Speaking to'plamlari", count: speakingCount },
    { href: "/admin/news", label: "Yangiliklar", count: newsCount },
    { href: "/admin/users", label: "Foydalanuvchilar", count: userCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Admin panel</h1>
      <p className="text-slate-600 mb-6">
        Jami <span className="font-medium">{userCount}</span> ro&apos;yxatdan o&apos;tgan
        foydalanuvchi.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition"
          >
            <div className="text-2xl font-bold text-indigo-700">{c.count}</div>
            <div className="text-sm text-slate-600 mt-1">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
