import { showFeedback } from "@/components/modal";

export interface ParsedStudentRow {
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  location?: string;
  isValid: boolean;
  validationError?: string;
}

export const downloadStudentSampleCSV = () => {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    "FirstName,LastName,Email,Location\n" +
    "Alexander,Wright,awright@student.university.edu,Manila\n" +
    "Beatriz,Santos,bsantos@student.university.edu,Cebu\n";
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "boardquest_student_import_sample.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showFeedback.info("Sample Student CSV template downloaded.");
};

export const parseStudentCSV = (text: string): ParsedStudentRow[] => {
  const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) {
    showFeedback.error("CSV file contains no records or header only.");
    return [];
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z]/g, ""));
  const firstNameIdx = headers.findIndex((h) => h.includes("first") || h === "fname");
  const lastNameIdx = headers.findIndex((h) => h.includes("last") || h === "lname");
  const nameIdx = headers.findIndex((h) => h.includes("name") && !h.includes("first") && !h.includes("last"));
  const emailIdx = headers.findIndex((h) => h.includes("email"));
  const locationIdx = headers.findIndex((h) => h.includes("location") || h.includes("city"));

  const rows: ParsedStudentRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    if (!currentLine) continue;

    const values = currentLine.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));

    let firstName = "";
    let lastName = "";
    let name: string;

    if (firstNameIdx !== -1 && values[firstNameIdx]) {
      firstName = values[firstNameIdx];
    }
    if (lastNameIdx !== -1 && values[lastNameIdx]) {
      lastName = values[lastNameIdx];
    }

    if (firstName || lastName) {
      name = [firstName, lastName].filter(Boolean).join(" ").trim();
    } else if (nameIdx !== -1 && values[nameIdx]) {
      name = values[nameIdx];
      const parts = name.split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    } else {
      name = values[0] || "";
    }

    const email = emailIdx !== -1 && values[emailIdx] ? values[emailIdx] : values[1] || "";
    const location = locationIdx !== -1 && values[locationIdx] ? values[locationIdx] : values[2] || "";

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    let isValid = true;
    let validationError = "";

    if (!name && !firstName) {
      isValid = false;
      validationError = "Missing Name";
    } else if (!email || !isValidEmail) {
      isValid = false;
      validationError = "Invalid Email";
    }

    rows.push({
      firstName,
      lastName,
      name,
      email,
      location: location || "Philippines",
      isValid,
      validationError,
    });
  }

  return rows;
};
