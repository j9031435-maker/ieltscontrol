import { z } from "zod";

// Shape of the data behind a Writing Task 1 diagram. Stored JSON-encoded in
// WritingTask.chartData and rendered as a real chart (see WritingChart.tsx),
// which is what the actual IELTS Academic Task 1 shows candidates.
export const chartSpecSchema = z.object({
  type: z.enum(["bar", "line", "pie", "table"]),
  title: z.string().min(2),
  unit: z.string().default(""),
  categories: z.array(z.string().min(1)).min(2).max(12),
  series: z
    .array(
      z.object({
        name: z.string().min(1),
        values: z.array(z.number()).min(2).max(12),
      })
    )
    .min(1)
    .max(5),
});

export type ChartSpec = z.infer<typeof chartSpecSchema>;

export function parseChartSpec(raw: string | null | undefined): ChartSpec | null {
  if (!raw) return null;
  try {
    const parsed = chartSpecSchema.parse(JSON.parse(raw));
    // A pie chart only makes sense with a single series.
    if (parsed.type === "pie" && parsed.series.length > 1) {
      return { ...parsed, type: "bar" };
    }
    // Every series must line up with the category axis.
    if (parsed.series.some((s) => s.values.length !== parsed.categories.length)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
