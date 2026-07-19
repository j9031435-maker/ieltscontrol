import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) notFound();

  const dateFormatter = new Intl.DateTimeFormat("uz-UZ", { dateStyle: "long" });

  return (
    <article>
      <p className="text-xs text-slate-500 mb-2">{dateFormatter.format(post.createdAt)}</p>
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <div className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{post.body}</div>
    </article>
  );
}
