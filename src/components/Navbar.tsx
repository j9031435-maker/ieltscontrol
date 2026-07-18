"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Bosh sahifa" },
  { href: "/reading", label: "Reading" },
  { href: "/listening", label: "Listening" },
  { href: "/writing", label: "Writing" },
  { href: "/speaking", label: "Speaking" },
  { href: "/results", label: "Natijalar" },
];

export default function Navbar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/dashboard" className="font-bold text-indigo-600">
          IELTS Control
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-slate-500">{userName}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm font-medium text-slate-600 hover:text-red-600"
          >
            Chiqish
          </button>
        </div>
      </div>
      <nav className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
