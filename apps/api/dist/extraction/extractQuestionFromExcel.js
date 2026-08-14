import xlsx from "xlsx";
import { QuestionImportRowSchema } from "./extractQuestionFromCSV";
export function extractQuestionsFromExcel(buffer) {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const results = [];
    const validationErrors = [];
    for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        // Convert worksheet to JSON rows
        const rows = xlsx.utils.sheet_to_json(worksheet);
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            // Normalize keys to support casing options
            const rawRow = {
                question: (row.question || row.Question || row.text || row.Text || row.q || row.Q || "").toString().trim(),
                choices: (row.choices || row.Choices || row.options || row.Options || "").toString().trim(),
                correctAnswer: (row.correctAnswer || row.correct_answer || row.Answer || row.answer || "").toString().trim(),
                topic: (row.topic || row.Topic || row.subject || row.Subject || "").toString().trim(),
                difficulty: (row.difficulty || row.Difficulty || row.level || row.Level || "").toString().trim(),
                type: (row.type || row.Type || row.questionType || row.question_type || "").toString().trim(),
            };
            if (!rawRow.question)
                continue;
            const parsed = QuestionImportRowSchema.safeParse(rawRow);
            if (!parsed.success) {
                const errorMsgs = parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join(", ");
                validationErrors.push(`[Sheet: ${sheetName}] Row ${i + 2}: ${errorMsgs}`);
            }
            else {
                results.push(parsed.data);
            }
        }
    }
    if (validationErrors.length > 0) {
        throw new Error(`Excel Validation failed:\n${validationErrors.join("\n")}`);
    }
    return results;
}
