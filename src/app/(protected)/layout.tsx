import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Navbar from "@/components/Navbar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        userName={session.user.name ?? session.user.email ?? ""}
        isAdmin={session.user.role === "ADMIN"}
      />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
