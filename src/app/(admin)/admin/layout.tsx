import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";

const links = [
  { href: "/admin", label: "Bosh sahifa" },
  { href: "/admin/reading", label: "Reading" },
  { href: "/admin/listening", label: "Listening" },
  { href: "/admin/writing", label: "Writing" },
  { href: "/admin/speaking", label: "Speaking" },
  { href: "/admin/news", label: "Yangiliklar" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/admin" className="font-bold">
            Admin panel
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">
            Saytga qaytish
          </Link>
        </div>
        <nav className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
