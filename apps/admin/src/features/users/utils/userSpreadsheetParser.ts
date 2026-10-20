import { showFeedback } from "@/components/modal";
import * as XLSX from "xlsx";
import type { ParsedUserRow } from "@/features/users/types/types";

export const downloadSampleUserCSV = (category: "internal" | "external") => {
  if (category === "external") {
    const csvContent =
      "CompanyName,FirstName,LastName,PartnerID,Email,PhoneNumber,Location\n" +
      'TopRank Review Academy,Roberto,Cruz,RC-1001,roberto.cruz@toprankreview.edu.ph,09171234567,"Sampaloc, Manila"\n' +
      'St. Jude Review Center,Maria,Santos,RC-1002,maria.santos@stjudereview.edu.ph,09187654321,"Cebu City"\n' +
      'Apex Review Services,Jonathan,Reyes,RC-1003,jreyes@apexreview.com,09191234567,"Davao City"';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "BoardQuest_External_Users_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback.info("Sample External Partners template (.csv) downloaded.");
  } else {
    const csvContent =
      "FirstName,MiddleName,LastName,EmployeeID,Email,PhoneNumber,Role\n" +
      "Jane,Smith,Doe,EMP-001,jane.doe@boardquest.edu,09171234567,TEACHER\n" +
      "Juan,,Dela Cruz,EMP-002,juan.delacruz@boardquest.edu,09187654321,TEAMLEAD\n" +
      "Elena,,Reyes,EMP-003,elena.reyes@boardquest.edu,09191234567,DEAN";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "BoardQuest_Internal_Users_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback.info("Sample Internal Users template (.csv) downloaded.");
  }
};

export const downloadSampleUserXLSX = (category: "internal" | "external") => {
  if (category === "external") {
    const data = [
      [
        "CompanyName",
        "FirstName",
        "LastName",
        "PartnerID",
        "Email",
        "PhoneNumber",
        "Location",
      ],
      [
        "TopRank Review Academy",
        "Roberto",
        "Cruz",
        "RC-1001",
        "roberto.cruz@toprankreview.edu.ph",
        "09171234567",
        "Sampaloc, Manila",
      ],
      [
        "St. Jude Review Center",
        "Maria",
        "Santos",
        "RC-1002",
        "maria.santos@stjudereview.edu.ph",
        "09187654321",
        "Cebu City",
      ],
      [
        "Apex Review Services",
        "Jonathan",
        "Reyes",
        "RC-1003",
        "jreyes@apexreview.com",
        "09191234567",
        "Davao City",
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "External Partners");
    XLSX.writeFile(wb, "BoardQuest_External_Users_Template.xlsx");
    showFeedback.info("Sample External Partners template (.xlsx) downloaded.");
  } else {
    const data = [
      [
        "FirstName",
        "MiddleName",
        "LastName",
        "EmployeeID",
        "Email",
        "PhoneNumber",
        "Role",
      ],
      [
        "Jane",
        "Smith",
        "Doe",
        "EMP-001",
        "jane.doe@boardquest.edu",
        "09171234567",
        "TEACHER",
      ],
      [
        "Juan",
        "",
        "Dela Cruz",
        "EMP-002",
        "juan.delacruz@boardquest.edu",
        "09187654321",
        "TEAMLEAD",
      ],
      [
        "Elena",
        "",
        "Reyes",
        "EMP-003",
        "elena.reyes@boardquest.edu",
        "09191234567",
        "DEAN",
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Internal Users");
    XLSX.writeFile(wb, "BoardQuest_Internal_Users_Template.xlsx");
    showFeedback.info("Sample Internal Users template (.xlsx) downloaded.");
  }
};

export const parseUserSpreadsheetData = (
  sheetData: (string | number)[][],
  category: "internal" | "external",
): ParsedUserRow[] => {
  if (!sheetData || sheetData.length <= 1) {
    showFeedback.error("Spreadsheet contains no records or header only.");
    return [];
  }

  const rawHeaders = sheetData[0] || [];
  const headers = rawHeaders.map((h) =>
    String(h ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ""),
  );

  const isExternal = category === "external";

  if (isExternal) {
    const companyIdx = headers.findIndex(
      (h) =>
        h.includes("company") ||
        h.includes("org") ||
        h.includes("review") ||
        h.includes("center") ||
        h.includes("institution") ||
        h.includes("agency"),
    );
    const firstNameIdx = headers.findIndex(
      (h) => h.includes("first") || h === "fname" || h === "firstname",
    );
    const lastNameIdx = headers.findIndex(
      (h) =>
        h.includes("last") ||
        h === "lname" ||
        h === "lastname" ||
        h.includes("surname"),
    );
    const nameIdx = headers.findIndex(
      (h) =>
        (h === "name" ||
          h === "fullname" ||
          h.includes("representative") ||
          h === "repname") &&
        !h.includes("company") &&
        !h.includes("first") &&
        !h.includes("last"),
    );
    const partnerIdIdx = headers.findIndex(
      (h) =>
        h.includes("partner") ||
        h.includes("employee") ||
        h === "partnerid" ||
        h === "empid" ||
        h === "id" ||
        h === "code" ||
        (h.endsWith("id") && !h.includes("middle")),
    );
    const emailIdx = headers.findIndex(
      (h) => h.includes("email") || h === "mail",
    );
    const phoneIdx = headers.findIndex(
      (h) =>
        h.includes("phone") ||
        h.includes("contact") ||
        h.includes("mobile") ||
        h.includes("cell") ||
        (h.includes("number") && !h.includes("id")),
    );
    const locationIdx = headers.findIndex(
      (h) =>
        h.includes("location") ||
        h.includes("address") ||
        h.includes("branch") ||
        h.includes("campus") ||
        h.includes("city"),
    );

    const rows: ParsedUserRow[] = [];

    for (let i = 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (!row || !Array.isArray(row)) continue;

      const hasAnyValue = row.some(
        (cell) => String(cell ?? "").trim().length > 0,
      );
      if (!hasAnyValue) continue;

      const companyName =
        companyIdx !== -1 && row[companyIdx] !== undefined
          ? String(row[companyIdx]).trim()
          : String(row[0] ?? "").trim();
      let firstName =
        firstNameIdx !== -1 && row[firstNameIdx] !== undefined
          ? String(row[firstNameIdx]).trim()
          : "";
      let lastName =
        lastNameIdx !== -1 && row[lastNameIdx] !== undefined
          ? String(row[lastNameIdx]).trim()
          : "";
      let name: string;

      if (firstName || lastName) {
        name = [firstName, lastName].filter(Boolean).join(" ").trim();
      } else if (nameIdx !== -1 && row[nameIdx] !== undefined) {
        name = String(row[nameIdx]).trim();
        const parts = name.split(/\s+/);
        firstName = parts[0] || "";
        lastName = parts.slice(1).join(" ") || "";
      } else {
        name = String(row[1] ?? "").trim();
      }

      const employeeId =
        partnerIdIdx !== -1 && row[partnerIdIdx] !== undefined
          ? String(row[partnerIdIdx]).trim()
          : String(row[2] ?? "").trim();
      const email =
        emailIdx !== -1 && row[emailIdx] !== undefined
          ? String(row[emailIdx]).trim().toLowerCase()
          : String(row[3] ?? "")
              .trim()
              .toLowerCase();
      const phoneNumber =
        phoneIdx !== -1 && row[phoneIdx] !== undefined
          ? String(row[phoneIdx]).trim()
          : String(row[4] ?? "").trim();
      const location =
        locationIdx !== -1 && row[locationIdx] !== undefined
          ? String(row[locationIdx]).trim()
          : String(row[5] ?? "").trim() || "Philippines";

      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      let isValid = true;
      let validationError = "";

      if (!companyName) {
        isValid = false;
        validationError = "Missing Organization Name";
      } else if (!name && !firstName) {
        isValid = false;
        validationError = "Missing Representative Name";
      } else if (!email || !isValidEmail) {
        isValid = false;
        validationError = "Invalid Email";
      } else if (!phoneNumber) {
        isValid = false;
        validationError = "Missing Phone Number";
      } else if (!employeeId) {
        isValid = false;
        validationError = "Missing Partner ID";
      }

      rows.push({
        name: name || `${firstName} ${lastName}`.trim(),
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email,
        role: "EXTERNAL",
        companyName,
        employeeId: employeeId || undefined,
        phoneNumber: phoneNumber || undefined,
        location: location || "Philippines",
        isValid,
        validationError,
      });
    }

    return rows;
  }

  // Internal Users parsing
  const firstNameIdx = headers.findIndex(
    (h) => h.includes("first") || h === "fname" || h === "firstname",
  );
  const middleNameIdx = headers.findIndex(
    (h) =>
      h.includes("middle") ||
      h === "mname" ||
      h === "mi" ||
      h === "middlename",
  );
  const lastNameIdx = headers.findIndex(
    (h) =>
      h.includes("last") ||
      h === "lname" ||
      h === "lastname" ||
      h.includes("surname"),
  );
  const nameIdx = headers.findIndex(
    (h) =>
      (h === "name" || h === "fullname") &&
      !h.includes("first") &&
      !h.includes("middle") &&
      !h.includes("last"),
  );
  const empIdIdx = headers.findIndex(
    (h) =>
      h.includes("employee") ||
      h === "empid" ||
      h === "employeeid" ||
      h === "id" ||
      h === "idnumber" ||
      h === "idno" ||
      (h.endsWith("id") && !h.includes("middle")),
  );
  const emailIdx = headers.findIndex(
    (h) => h.includes("email") || h === "mail",
  );
  const phoneIdx = headers.findIndex(
    (h) =>
      h.includes("phone") ||
      h.includes("contact") ||
      h.includes("mobile") ||
      h.includes("cell") ||
      (h.includes("number") && !h.includes("id")),
  );
  const roleIdx = headers.findIndex(
    (h) =>
      h.includes("role") ||
      h.includes("position") ||
      h.includes("designation"),
  );

  const rows: ParsedUserRow[] = [];

  for (let i = 1; i < sheetData.length; i++) {
    const row = sheetData[i];
    if (!row || !Array.isArray(row)) continue;

    const hasAnyValue = row.some(
      (cell) => String(cell ?? "").trim().length > 0,
    );
    if (!hasAnyValue) continue;

    let firstName =
      firstNameIdx !== -1 && row[firstNameIdx] !== undefined
        ? String(row[firstNameIdx]).trim()
        : "";
    let middleName =
      middleNameIdx !== -1 && row[middleNameIdx] !== undefined
        ? String(row[middleNameIdx]).trim()
        : "";
    let lastName =
      lastNameIdx !== -1 && row[lastNameIdx] !== undefined
        ? String(row[lastNameIdx]).trim()
        : "";
    let name: string;

    if (firstName || lastName) {
      name = [firstName, middleName, lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
    } else if (nameIdx !== -1 && row[nameIdx] !== undefined) {
      name = String(row[nameIdx]).trim();
      const parts = name.split(/\s+/);
      if (parts.length === 1) {
        firstName = parts[0] || "";
      } else if (parts.length === 2) {
        firstName = parts[0] || "";
        lastName = parts[1] || "";
      } else {
        firstName = parts[0] || "";
        middleName = parts[1] || "";
        lastName = parts.slice(2).join(" ") || "";
      }
    } else {
      name = String(row[0] ?? "").trim();
    }

    const employeeId =
      empIdIdx !== -1 && row[empIdIdx] !== undefined
        ? String(row[empIdIdx]).trim()
        : String(row[3] ?? "").trim();
    const email =
      emailIdx !== -1 && row[emailIdx] !== undefined
        ? String(row[emailIdx]).trim().toLowerCase()
        : String(row[4] ?? "")
            .trim()
            .toLowerCase();
    const phoneNumber =
      phoneIdx !== -1 && row[phoneIdx] !== undefined
        ? String(row[phoneIdx]).trim()
        : String(row[5] ?? "").trim();

    let rawRole =
      roleIdx !== -1 && row[roleIdx] !== undefined
        ? String(row[roleIdx]).trim().toUpperCase()
        : String(row[6] ?? "")
            .trim()
            .toUpperCase() || "TEACHER";
    if (rawRole === "ADMIN" || rawRole === "DEAN") rawRole = "DEAN";
    else if (rawRole === "TEAMLEAD" || rawRole === "CO-ADMIN")
      rawRole = "TEAMLEAD";
    else rawRole = "TEACHER";

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    let isValid = true;
    let validationError = "";

    if (!name && !firstName) {
      isValid = false;
      validationError = "Missing Name";
    } else if (!employeeId) {
      isValid = false;
      validationError = "Missing Employee ID";
    } else if (!email || !isValidEmail) {
      isValid = false;
      validationError = "Invalid Email";
    } else if (!phoneNumber) {
      isValid = false;
      validationError = "Missing Phone Number";
    }

    rows.push({
      name:
        name ||
        [firstName, middleName, lastName].filter(Boolean).join(" ").trim(),
      firstName: firstName || undefined,
      middleName: middleName || undefined,
      lastName: lastName || undefined,
      email,
      role: rawRole,
      employeeId: employeeId || undefined,
      phoneNumber: phoneNumber || undefined,
      isValid,
      validationError,
    });
  }

  return rows;
};

export const parseUserSpreadsheetFile = async (
  selectedFile: File,
  category: "internal" | "external",
): Promise<ParsedUserRow[]> => {
  const fileName = selectedFile.name.toLowerCase();
  const isCSV = fileName.endsWith(".csv");
  const isXLSX = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

  if (!isCSV && !isXLSX) {
    showFeedback.error("Please upload a valid .csv or .xlsx file");
    return [];
  }

  try {
    const buffer = await selectedFile.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      showFeedback.error("Spreadsheet file contains no sheets.");
      return [];
    }
    const worksheet = workbook.Sheets[firstSheetName];
    const sheetData = XLSX.utils.sheet_to_json<(string | number)[]>(worksheet, {
      header: 1,
      defval: "",
      blankrows: false,
    });

    return parseUserSpreadsheetData(sheetData, category);
  } catch (err) {
    console.error("Error parsing spreadsheet:", err);
    showFeedback.error("Failed to read spreadsheet file. Please check file format.");
    return [];
  }
};
