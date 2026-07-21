import Link from "next/link";

const sections = [
  {
    title: "Listening",
    desc: "Audio matnni tinglab, savollarga javob bering.",
  },
  {
    title: "Reading",
    desc: "Matnlarni o'qib, tushunish savollarini yeching.",
  },
  {
    title: "Writing",
    desc: "Task 1 va Task 2 insholaringizni AI band-score bo'yicha baholaydi.",
  },
  {
    title: "Speaking",
    desc: "Savollarga ovozli javob bering, AI nutqingizni tahlil qiladi.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-indigo-600 text-lg">IELTS Control</span>
          <div className="flex items-center gap-3">
            <Link
              href="/news"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Yangiliklar
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Kirish
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-3xl mx-auto text-center px-4 py-24">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            IELTS imtihoniga to&apos;liq tayyorgarlik
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Imtihonni real topshirishdan oldin barcha 4 ta bo&apos;lim bo&apos;yicha
            mashq qiling. Writing va Speaking javoblaringizni sun&apos;iy intellekt
            IELTS band-score mezonlari asosida tahlil qilib, batafsil fikr-mulohaza
            beradi.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
            >
              Kirish
            </Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((s) => (
            <div
              key={s.title}
              className="bg-white border border-slate-200 rounded-xl p-5"
            >
              <h3 className="font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        IELTS Control — mashq va tayyorgarlik platformasi
      </footer>
    </div>
  );
}
