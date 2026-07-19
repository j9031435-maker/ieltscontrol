import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteNewsPost } from "@/lib/actions/adminNews";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminNewsListPage() {
  const posts = await prisma.newsPost.findMany({ orderBy: { createdAt: "desc" } });
  const dateFormatter = new Intl.DateTimeFormat("uz-UZ", { dateStyle: "medium" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Yangiliklar</h1>
        <Link
          href="/admin/news/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Yangi post
        </Link>
      </div>
      <div className="space-y-3">
        {posts.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="text-xs text-slate-500">{dateFormatter.format(p.createdAt)}</p>
              <h2 className="font-semibold">{p.title}</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/news/${p.id}/edit`}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                Tahrirlash
              </Link>
              <DeleteButton
                action={deleteNewsPost.bind(null, p.id)}
                confirmText={`"${p.title}" postini o'chirishni tasdiqlaysizmi?`}
              />
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-sm text-slate-500">Hali yangilik qo&apos;shilmagan.</p>
        )}
      </div>
    </div>
  );
}
