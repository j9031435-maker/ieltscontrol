import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import UserForm from "@/components/admin/UserForm";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const [session, user] = await Promise.all([
    auth(),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);
  if (!user) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Foydalanuvchini tahrirlash</h1>
      <UserForm
        userId={user.id}
        isSelf={session?.user.id === user.id}
        initial={{ name: user.name, email: user.email, role: user.role }}
      />
    </div>
  );
}
