export default function BandScoreCard({ band, label }: { band: number; label?: string }) {
  return (
    <div className="inline-flex items-center gap-4 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4">
      <div className="text-3xl font-bold text-indigo-700">{band.toFixed(1)}</div>
      <div>
        <div className="text-sm font-medium text-indigo-900">Band Score</div>
        {label && <div className="text-xs text-indigo-700">{label}</div>}
      </div>
    </div>
  );
}
