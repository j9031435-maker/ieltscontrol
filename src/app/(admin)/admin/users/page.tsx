import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteUser } from "@/lib/actions/adminUsers";
import DeleteButton from "@/components/admin/DeleteButton";
import { getAllUserResults, SECTIONS } from "@/lib/userResults";

const SECTION_LABELS: Record<(typeof SECTIONS)[number], string> = {
  READING: "R",
  LISTENING: "L",
  WRITING: "W",
  SPEAKING: "S",
};

export default async function AdminUsersListPage() {
  const session = await auth();
  const [users, resultsByUser] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    getAllUserResults(),
  ]);
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
              <th className="px-4 py-2 font-medium">IELTS natijalari</th>
              <th className="px-4 py-2 font-medium">Ro&apos;yxatdan o&apos;tgan</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const results = resultsByUser.get(u.id);
              return (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 whitespace-nowrap">{u.name}</td>
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
                  <td className="px-4 py-2">
                    {results ? (
                      <div className="flex flex-wrap items-center gap-1">
                        {SECTIONS.map((s) => {
                          const band = results.latestBySection[s]?.bandScore;
                          return (
                            <span
                              key={s}
                              className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                band !== undefined
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-slate-50 text-slate-300"
                              }`}
                            >
                              {SECTION_LABELS[s]}: {band !== undefined ? band.toFixed(1) : "-"}
                            </span>
                          );
                        })}
                        {results.overallBand !== null && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                            Umumiy {results.overallBand.toFixed(1)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Hali test topshirilmagan</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-500 whitespace-nowrap">
                    {dateFormatter.format(u.createdAt)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-4">
                      {results && results.overallBand !== null && (
                        <a
                          href={`/api/admin/certificate/${u.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
                        >
                          Sertifikat
                        </a>
                      )}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
