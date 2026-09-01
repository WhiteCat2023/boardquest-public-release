/**
 * Statistical calculations engine for Review Center assessments and board ratings.
 */
export const MEDTECH_SUBJECT_WEIGHTS = {
    "Clinical Chemistry": 0.20,
    "Microbiology": 0.20,
    "Microbiology & Parasitology": 0.20,
    "Hematology": 0.20,
    "Immunology & Serology and Immunohematology": 0.20,
    "Clinical Microscopy & Parasitology": 0.10,
    "Histopathology and Medtech Laws": 0.10,
};
export const MEDTECH_SUBJECTS = [
    "Clinical Chemistry",
    "Microbiology & Parasitology",
    "Hematology",
    "Immunology & Serology and Immunohematology",
    "Clinical Microscopy & Parasitology",
    "Histopathology and Medtech Laws",
];
/**
 * Standardize subject name matching
 */
export function normalizeMedTechSubject(subject) {
    const s = subject.trim().toLowerCase();
    if (s.includes("chem"))
        return "Clinical Chemistry";
    if (s.includes("microscopy") || s.includes("urine") || s.includes("body fluid")) {
        return "Clinical Microscopy & Parasitology";
    }
    if (s.includes("micro") || s.includes("parasit")) {
        return "Microbiology & Parasitology";
    }
    if (s.includes("immuno") || s.includes("sero") || s.includes("blood bank")) {
        return "Immunology & Serology and Immunohematology";
    }
    if (s.includes("hema"))
        return "Hematology";
    if (s.includes("histo") || s.includes("law") || s.includes("ethics")) {
        return "Histopathology and Medtech Laws";
    }
    return subject.trim();
}
/**
 * Compute the Mean of an array of numeric scores.
 */
export function calculateMean(scores) {
    if (!scores || scores.length === 0)
        return 0;
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    return Number((sum / scores.length).toFixed(2));
}
/**
 * Compute the Median of an array of numeric scores.
 */
export function calculateMedian(scores) {
    if (!scores || scores.length === 0)
        return 0;
    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 !== 0) {
        return Number(sorted[mid].toFixed(2));
    }
    return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}
/**
 * Compute the Mode(s) of an array of numeric scores.
 * Returns array of modal scores. If all scores have frequency 1 or identical frequency, returns [].
 */
export function calculateMode(scores) {
    if (!scores || scores.length === 0)
        return [];
    if (scores.length === 1)
        return [scores[0]];
    const freqMap = new Map();
    for (const s of scores) {
        const val = Number(s.toFixed(2));
        freqMap.set(val, (freqMap.get(val) || 0) + 1);
    }
    let maxFreq = 0;
    for (const freq of freqMap.values()) {
        if (freq > maxFreq) {
            maxFreq = freq;
        }
    }
    // If max frequency is 1 (all distinct) or every item has the same frequency, there is no unique mode
    if (maxFreq === 1)
        return [];
    const modes = [];
    let allEqualFreq = true;
    for (const [val, freq] of freqMap.entries()) {
        if (freq === maxFreq) {
            modes.push(val);
        }
        else {
            allEqualFreq = false;
        }
    }
    if (allEqualFreq && freqMap.size > 1) {
        return [];
    }
    return modes.sort((a, b) => a - b);
}
/**
 * Calculate Midpoint Percentile Rank for each student.
 * Midpoint formula properly handles ties:
 * Percentile = ((scores_less + 0.5 * scores_equal) / N) * 100
 */
export function calculatePercentileRanks(items) {
    const result = new Map();
    if (!items || items.length === 0)
        return result;
    const N = items.length;
    const allScores = items.map((i) => i.score);
    for (const item of items) {
        let strictlyLess = 0;
        let equal = 0;
        for (const s of allScores) {
            if (s < item.score) {
                strictlyLess++;
            }
            else if (s === item.score) {
                equal++;
            }
        }
        const percentile = ((strictlyLess + 0.5 * equal) / N) * 100;
        result.set(item.candidateId, Number(percentile.toFixed(2)));
    }
    return result;
}
/**
 * Calculate General Weighted Average (GWA) based on official Philippine MedTech Board Exam weights.
 */
export function calculateMedTechGeneralAverage(subjectScores) {
    let weightedSum = 0;
    let totalWeight = 0;
    const failedSubjects = [];
    for (const item of subjectScores) {
        const normalized = normalizeMedTechSubject(item.subject);
        const weight = MEDTECH_SUBJECT_WEIGHTS[normalized] || 0.1667; // fallback equal weight
        weightedSum += item.score * weight;
        totalWeight += weight;
        if (item.score < 50) {
            failedSubjects.push(normalized);
        }
    }
    const gwa = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 0;
    const conditionFailed = failedSubjects.length > 0;
    const passed = gwa >= 75 && !conditionFailed;
    return {
        gwa,
        passed,
        conditionFailed,
        failedSubjects,
    };
}
