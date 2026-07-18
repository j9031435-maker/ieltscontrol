// Approximate IELTS-style raw-score-to-band curve. Real Reading/Listening
// conversion tables vary by test version and use exactly 40 questions;
// this is a percentage-based approximation for practice purposes.
const BAND_TABLE: [number, number][] = [
  [100, 9],
  [97, 8.5],
  [90, 8],
  [83, 7.5],
  [75, 7],
  [67, 6.5],
  [58, 6],
  [50, 5.5],
  [42, 5],
  [33, 4.5],
  [25, 4],
  [17, 3.5],
  [0, 3],
];

export function percentageToBand(pct: number): number {
  for (const [minPct, band] of BAND_TABLE) {
    if (pct >= minPct) return band;
  }
  return 3;
}

export function rawScoreToBand(rawScore: number, total: number): number {
  if (total === 0) return 0;
  const pct = (rawScore / total) * 100;
  return percentageToBand(pct);
}

// Official IELTS overall band rounding: average of 4 skill bands, where an
// average ending in .25 rounds up to the next half band and .75 rounds up
// to the next whole band.
export function computeOverallBand(sectionBands: number[]): number | null {
  if (sectionBands.length === 0) return null;
  const avg = sectionBands.reduce((a, b) => a + b, 0) / sectionBands.length;
  const whole = Math.floor(avg);
  const remainder = avg - whole;
  if (remainder < 0.25) return whole;
  if (remainder < 0.75) return whole + 0.5;
  return whole + 1;
}
