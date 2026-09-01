/**
 * Client-side statistical calculation helpers for Review Center UI.
 */

export function calculateMean(scores: number[]): number {
  if (!scores || scores.length === 0) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Number((sum / scores.length).toFixed(2));
}

export function calculateMedian(scores: number[]): number {
  if (!scores || scores.length === 0) return 0;
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return Number(sorted[mid].toFixed(2));
  }
  return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}

export function calculateMode(scores: number[]): number[] {
  if (!scores || scores.length === 0) return [];
  if (scores.length === 1) return [scores[0]];

  const freqMap = new Map<number, number>();
  for (const s of scores) {
    const val = Number(s.toFixed(2));
    freqMap.set(val, (freqMap.get(val) || 0) + 1);
  }

  let maxFreq = 0;
  for (const freq of freqMap.values()) {
    if (freq > maxFreq) maxFreq = freq;
  }

  if (maxFreq === 1) return [];

  const modes: number[] = [];
  let allEqual = true;
  for (const [val, freq] of freqMap.entries()) {
    if (freq === maxFreq) {
      modes.push(val);
    } else {
      allEqual = false;
    }
  }

  if (allEqual && freqMap.size > 1) return [];
  return modes.sort((a, b) => a - b);
}

export function calculatePercentile(score: number, allScores: number[]): number {
  if (!allScores || allScores.length === 0) return 0;
  let strictlyLess = 0;
  let equal = 0;

  for (const s of allScores) {
    if (s < score) strictlyLess++;
    else if (s === score) equal++;
  }

  const percentile = ((strictlyLess + 0.5 * equal) / allScores.length) * 100;
  return Number(percentile.toFixed(1));
}
