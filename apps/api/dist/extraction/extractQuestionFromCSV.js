import { z } from "zod";
import { QuestionDifficulty, QuestionType } from "../types/prisma.types";
export const QuestionImportRowSchema = z.object({
    question: z.string().min(1, "Question wording cannot be empty"),
    choices: z.preprocess((val) => {
        if (typeof val === "string") {
            return val.split(/[;|]/).map(c => c.trim()).filter(Boolean);
        }
        if (Array.isArray(val)) {
            return val.map(c => String(c).trim()).filter(Boolean);
        }
        return [];
    }, z.array(z.string())),
    correctAnswer: z.string().min(1, "Correct answer cannot be empty"),
    topic: z.string().optional().default("General"),
    difficulty: z.preprocess((val) => {
        const s = String(val).toUpperCase().trim();
        return s || "EASY";
    }, z.nativeEnum(QuestionDifficulty)),
    cognitiveLevel: z.preprocess((val) => {
        const s = String(val).toUpperCase().trim();
        if (s === "HOTS")
            return "HOTS";
        if (s === "LOTS")
            return "LOTS";
        return undefined;
    }, z.enum(["LOTS", "HOTS"]).optional()),
    type: z.preprocess((val) => {
        const s = String(val).toUpperCase().trim().replace(/[-\s]/g, "_");
        if (s === "TF" || s === "TRUE/FALSE" || s === "TRUE_FALSE")
            return "TRUE_FALSE";
        if (s === "SA" || s === "SHORTANSWER" || s === "SHORT_ANSWER")
            return "SHORT_ANSWER";
        return s || "MCQ";
    }, z.nativeEnum(QuestionType)),
    feedback: z.string().optional().default(""),
});
export function extractQuestionsFromCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    const results = [];
    if (lines.length <= 1)
        return [];
    // Parse header to get column mappings
    const header = parseCSVLine(lines[0]);
    const colMap = new Map();
    header.forEach((h, index) => {
        colMap.set(h.toLowerCase().trim().replace(/["']/g, ""), index);
    });
    const getColVal = (parsedLine, possibleNames) => {
        for (const name of possibleNames) {
            const idx = colMap.get(name.toLowerCase());
            if (idx !== undefined && idx < parsedLine.length) {
                return parsedLine[idx].trim();
            }
        }
        return "";
    };
    const validationErrors = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const parsedLine = parseCSVLine(line);
        if (parsedLine.length === 0)
            continue;
        const rawRow = {
            question: getColVal(parsedLine, ["question", "text", "q"]),
            choices: getColVal(parsedLine, ["choices", "options"]),
            correctAnswer: getColVal(parsedLine, ["correctanswer", "answer", "correct_answer"]),
            topic: getColVal(parsedLine, ["topic", "subject"]),
            difficulty: getColVal(parsedLine, ["difficulty", "level"]),
            cognitiveLevel: getColVal(parsedLine, ["cognitivelevel", "cognitive_level", "cognitive"]),
            type: getColVal(parsedLine, ["type", "questiontype"]),
        };
        // If the question is completely empty, skip it quietly
        if (!rawRow.question)
            continue;
        const parsed = QuestionImportRowSchema.safeParse(rawRow);
        if (!parsed.success) {
            const errorMsgs = parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join(", ");
            validationErrors.push(`Row ${i + 1}: ${errorMsgs}`);
        }
        else {
            const itemDifficulty = parsed.data.difficulty;
            const itemCognitiveLevel = parsed.data.cognitiveLevel ||
                (itemDifficulty === QuestionDifficulty.HARD ? "HOTS" : "LOTS");
            results.push({
                ...parsed.data,
                cognitiveLevel: itemCognitiveLevel,
            });
        }
    }
    if (validationErrors.length > 0) {
        throw new Error(`CSV Validation failed:\n${validationErrors.join("\n")}`);
    }
    return results;
}
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        }
        else if (char === ',' && !inQuotes) {
            result.push(current);
            current = "";
        }
        else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
