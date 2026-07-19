import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function NewsListPage() {
  const posts = await prisma.newsPost.findMany({ orderBy: { createdAt: "desc" } });
  const dateFormatter = new Intl.DateTimeFormat("uz-UZ", { dateStyle: "long" });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Yangiliklar</h1>
      {posts.length === 0 ? (
        <p className="text-sm text-slate-500">Hozircha yangiliklar yo&apos;q.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/news/${p.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <p className="text-xs text-slate-500 mb-1">{dateFormatter.format(p.createdAt)}</p>
              <h2 className="font-semibold text-lg">{p.title}</h2>
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">{p.body}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
