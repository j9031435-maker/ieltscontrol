import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewsForm from "@/components/admin/NewsForm";

export default async function EditNewsPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id: postId } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Postni tahrirlash</h1>
      <NewsForm postId={post.id} initial={{ title: post.title, body: post.body }} />
    </div>
  );
}
