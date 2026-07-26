import RegenerateButton from "@/components/admin/RegenerateButton";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sozlamalar</h1>
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 max-w-2xl">
        <h2 className="text-lg font-bold text-red-800 mb-2">Xavfli zona</h2>
        <p className="text-sm text-red-700 mb-1">
          Quyidagi tugma sun&apos;iy intellekt yordamida <strong>barcha</strong> Reading, Listening,
          Writing va Speaking testlarini butunlay yangi, zamonaviy mavzulardagi testlarga
          almashtiradi.
        </p>
        <p className="text-sm text-red-700 mb-4">
          <strong>Diqqat:</strong> bu amal barcha o&apos;quvchilarning oldingi natijalarini (barcha
          urinishlar tarixini) butunlay va qaytarib bo&apos;lmas tarzda o&apos;chirib tashlaydi. Bu
          amalni ortga qaytarib bo&apos;lmaydi.
        </p>
        <RegenerateButton />
      </div>
    </div>
  );
}
