import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteUser } from "@/lib/actions/adminUsers";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminUsersListPage() {
  const session = await auth();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  const dateFormatter = new Intl.DateTimeFormat("uz-UZ", { dateStyle: "medium" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
        <Link
          href="/admin/users/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Yangi foydalanuvchi
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Ism</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Rol</th>
              <th className="px-4 py-2 font-medium">Ro&apos;yxatdan o&apos;tgan</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      u.role === "ADMIN"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-500">{dateFormatter.format(u.createdAt)}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/users/${u.id}/edit`}
                      className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
                    >
                      Tahrirlash
                    </Link>
                    {u.id !== session?.user.id && (
                      <DeleteButton
                        action={deleteUser.bind(null, u.id)}
                        confirmText={`"${u.name}" (${u.email}) hisobini o'chirishni tasdiqlaysizmi?`}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
