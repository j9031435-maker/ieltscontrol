import type { ChartSpec } from "@/lib/chartSpec";

const PALETTE = ["#4f46e5", "#0891b2", "#f59e0b", "#db2777", "#16a34a"];

const W = 640;
const H = 320;
const PAD_L = 52;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 52;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

function niceMax(value: number): number {
  if (value <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function Axes({ max, categories, unit }: { max: number; categories: string[]; unit: string }) {
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f * 100) / 100);
  const bandWidth = PLOT_W / categories.length;

  return (
    <>
      {ticks.map((t) => {
        const y = PAD_T + PLOT_H - (t / max) * PLOT_H;
        return (
          <g key={t}>
            <line x1={PAD_L} y1={y} x2={PAD_L + PLOT_W} y2={y} stroke="#e2e8f0" strokeWidth={1} />
            <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#64748b">
              {t}
              {unit}
            </text>
          </g>
        );
      })}
      {categories.map((c, i) => (
        <text
          key={c + i}
          x={PAD_L + bandWidth * i + bandWidth / 2}
          y={PAD_T + PLOT_H + 20}
          textAnchor="middle"
          fontSize={11}
          fill="#475569"
        >
          {c}
        </text>
      ))}
    </>
  );
}

function Legend({ names }: { names: string[] }) {
  if (names.length <= 1) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
      {names.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5 text-xs text-slate-600">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
          />
          {n}
        </span>
      ))}
    </div>
  );
}

function BarChart({ spec, max }: { spec: ChartSpec; max: number }) {
  const bandWidth = PLOT_W / spec.categories.length;
  const groupPad = bandWidth * 0.18;
  const barW = (bandWidth - groupPad * 2) / spec.series.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={spec.title}>
      <Axes max={max} categories={spec.categories} unit={spec.unit} />
      {spec.series.map((s, si) =>
        s.values.map((v, ci) => {
          const h = (v / max) * PLOT_H;
          return (
            <rect
              key={`${si}-${ci}`}
              x={PAD_L + bandWidth * ci + groupPad + barW * si}
              y={PAD_T + PLOT_H - h}
              width={Math.max(barW - 2, 1)}
              height={h}
              fill={PALETTE[si % PALETTE.length]}
              rx={2}
            />
          );
        })
      )}
    </svg>
  );
}

function LineChart({ spec, max }: { spec: ChartSpec; max: number }) {
  const stepX = spec.categories.length > 1 ? PLOT_W / (spec.categories.length - 1) : 0;
  const pointAt = (v: number, i: number) => ({
    x: PAD_L + stepX * i,
    y: PAD_T + PLOT_H - (v / max) * PLOT_H,
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={spec.title}>
      <Axes max={max} categories={spec.categories} unit={spec.unit} />
      {spec.series.map((s, si) => {
        const color = PALETTE[si % PALETTE.length];
        const d = s.values
          .map((v, i) => {
            const p = pointAt(v, i);
            return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
          })
          .join(" ");
        return (
          <g key={si}>
            <path d={d} fill="none" stroke={color} strokeWidth={2.5} />
            {s.values.map((v, i) => {
              const p = pointAt(v, i);
              return <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

function PieChart({ spec }: { spec: ChartSpec }) {
  const values = spec.series[0].values;
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const cx = W / 2;
  const cy = H / 2;
  const r = Math.min(PLOT_H, PLOT_W) / 2 - 8;

  let angle = -Math.PI / 2;
  const slices = values.map((v, i) => {
    const sweep = (v / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const largeArc = sweep > Math.PI ? 1 : 0;
    return {
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: PALETTE[i % PALETTE.length],
      key: i,
    };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={spec.title}>
      {slices.map((s) => (
        <path key={s.key} d={s.d} fill={s.color} stroke="#ffffff" strokeWidth={1.5} />
      ))}
    </svg>
  );
}

function DataTable({ spec }: { spec: ChartSpec }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-slate-600 border-b border-slate-200"></th>
            {spec.categories.map((c) => (
              <th
                key={c}
                className="px-3 py-2 text-right font-medium text-slate-600 border-b border-slate-200"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spec.series.map((s) => (
            <tr key={s.name} className="border-b border-slate-100 last:border-0">
              <td className="px-3 py-2 font-medium text-slate-700">{s.name}</td>
              {s.values.map((v, i) => (
                <td key={i} className="px-3 py-2 text-right text-slate-700">
                  {v}
                  {spec.unit}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WritingChart({ spec }: { spec: ChartSpec }) {
  const max = niceMax(Math.max(...spec.series.flatMap((s) => s.values)));

  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-5">
      <figcaption className="mb-3 text-sm font-semibold text-slate-800">{spec.title}</figcaption>
      {spec.type === "bar" && <BarChart spec={spec} max={max} />}
      {spec.type === "line" && <LineChart spec={spec} max={max} />}
      {spec.type === "pie" && <PieChart spec={spec} />}
      {spec.type === "table" && <DataTable spec={spec} />}
      {spec.type === "pie" ? (
        <Legend names={spec.categories} />
      ) : (
        <Legend names={spec.series.map((s) => s.name)} />
      )}
    </figure>
  );
}
