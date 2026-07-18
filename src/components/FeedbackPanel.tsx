import BandScoreCard from "./BandScoreCard";

interface CriteriaScore {
  label: string;
  value: number;
}

export default function FeedbackPanel({
  overallBand,
  criteria,
  strengths,
  weaknesses,
  suggestions,
  feedback,
  note,
}: {
  overallBand: number;
  criteria: CriteriaScore[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  feedback: string;
  note?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <BandScoreCard band={overallBand} label="Umumiy band" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {criteria.map((c) => (
            <div
              key={c.label}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center"
            >
              <div className="text-lg font-semibold text-slate-900">{c.value.toFixed(1)}</div>
              <div className="text-xs text-slate-500">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
      {note && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {note}
        </p>
      )}
      <p className="text-sm text-slate-700 leading-relaxed">{feedback}</p>
      <div className="grid sm:grid-cols-3 gap-4">
        <FeedbackList title="Kuchli tomonlar" items={strengths} color="green" />
        <FeedbackList title="Zaif tomonlar" items={weaknesses} color="red" />
        <FeedbackList title="Tavsiyalar" items={suggestions} color="indigo" />
      </div>
    </div>
  );
}

function FeedbackList({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "green" | "red" | "indigo";
}) {
  const colorClasses = {
    green: "border-green-200 bg-green-50",
    red: "border-red-200 bg-red-50",
    indigo: "border-indigo-200 bg-indigo-50",
  }[color];
  return (
    <div className={`rounded-lg border p-4 ${colorClasses}`}>
      <h4 className="font-medium text-sm mb-2">{title}</h4>
      <ul className="space-y-1 text-sm list-disc list-inside">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
