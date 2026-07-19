import Link from "next/link";
import { auth } from "@/auth";

export default async function NewsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-indigo-600 text-lg">
            IELTS Control
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/news" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Yangiliklar
            </Link>
            {session?.user ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  Kirish
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Ro&apos;yxatdan o&apos;tish
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">{children}</main>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        IELTS Control — mashq va tayyorgarlik platformasi
      </footer>
    </div>
  );
}
