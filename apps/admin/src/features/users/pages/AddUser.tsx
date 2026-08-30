import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  UserPlus,
  Users,
  ArrowLeft,
  Building2,
  Shield,
  CheckCircle2,
  Copy,
  AlertCircle,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { UserRole } from "@/types/question";
import type {
  RoleType,
  CreateUserPayload,
  ParsedUserRow,
} from "@/features/users";
import { getAllowedRolesToCreate } from "@/features/users/utils/userUtils";
import { useCreateUser, useBulkCreateUser } from "@/features/users";
import AddIndividualUserTab from "../components/AddIndividualUserTab";
import AddBulkUserTab from "../components/AddBulkUserTab";
import AddExternalUserTab from "../components/AddExternalUserTab";
import useRoleFlags from "@/hooks/useRoleFlags";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AddUser() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userRole } = useRoleFlags();
  const currentUserRole = userRole as RoleType;

  // Account Category: "internal" | "external"
  const typeParam = searchParams.get("type");
  const tabParam = searchParams.get("tab");
  const initialCategory =
    tabParam === "external" || typeParam === "external"
      ? "external"
      : "internal";
  const [accountCategory, setAccountCategory] = useState<
    "internal" | "external"
  >(initialCategory);

  // Sub-tab: "individual" | "bulk"
  const initialTab = tabParam === "bulk" ? "bulk" : "individual";
  const [activeTab, setActiveTab] = useState<"individual" | "bulk">(initialTab);

  const handleCategoryChange = (cat: "internal" | "external") => {
    setAccountCategory(cat);
    // Reset any pending uploaded file when switching category
    setFile(null);
    setParsedRows([]);
    setSearchParams({ type: cat, tab: activeTab });
  };

  const handleTabChange = (tab: "individual" | "bulk") => {
    setActiveTab(tab);
    setSearchParams({ type: accountCategory, tab });
  };

  // ----------------------------------------------------
  // INDIVIDUAL FORM STATE & HANDLERS
  // ----------------------------------------------------
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formData, setFormData] = useState<CreateUserPayload>({
    employeeId: "",
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: UserRole.TEACHER as RoleType,
  });
  const [errorMsg, setErrorMsg] = useState("");

  const createMutation = useCreateUser();

  useEffect(() => {
    const r = String(currentUserRole || "").toUpperCase();
    if (r === "SUPERADMIN" || currentUserRole === UserRole.SUPERADMIN) {
      setFormData((prev) => ({ ...prev, role: UserRole.DEAN }));
    } else if (r === "DEAN" || currentUserRole === UserRole.DEAN) {
      setFormData((prev) => ({ ...prev, role: UserRole.TEAMLEAD }));
    } else {
      setFormData((prev) => ({ ...prev, role: UserRole.TEACHER }));
    }
  }, [currentUserRole]);

  const allowedRoles = getAllowedRolesToCreate(currentUserRole);

  const handleFieldChange = (field: keyof CreateUserPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    employeeId?: string;
    companyName?: string;
    temporaryPassword?: string;
    role?: string;
    portalUrl?: string;
  } | null>(null);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("Please enter both First Name and Last Name.");
      return;
    }

    const fullName = [firstName.trim(), middleName.trim(), lastName.trim()]
      .filter(Boolean)
      .join(" ");

    const payload: CreateUserPayload = {
      ...formData,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: fullName,
    };

    createMutation.mutate(payload, {
      onSuccess: (res: any) => {
        const createdUser = res?.data?.data?.user || res?.data?.user;
        const tempPass = createdUser?.temporaryPassword;
        setCreatedCredentials({
          name: createdUser?.name || payload.name,
          email: createdUser?.email || payload.email,
          employeeId: createdUser?.employeeId || payload.employeeId,
          role: String(payload.role || "TEACHER"),
          temporaryPassword: tempPass,
          portalUrl: `${window.location.origin}/login`,
        });
        setIsCredentialsModalOpen(true);
        toast.success("User registered successfully!");
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || "Failed to register user.";
        setErrorMsg(msg);
        toast.error(msg);
      },
    });
  };

  const handleExternalSubmit = (payload: CreateUserPayload) => {
    setErrorMsg("");
    createMutation.mutate(payload, {
      onSuccess: (res: any) => {
        const createdUser = res?.data?.data?.user || res?.data?.user;
        const tempPass = createdUser?.temporaryPassword;
        setCreatedCredentials({
          name: createdUser?.name || payload.name,
          email: createdUser?.email || payload.email,
          employeeId: createdUser?.employeeId || payload.employeeId,
          companyName: createdUser?.companyName || payload.companyName,
          role: "EXTERNAL",
          temporaryPassword: tempPass,
          portalUrl: "http://localhost:5174/login",
        });
        setIsCredentialsModalOpen(true);
        toast.success(
          "Review Center representative account created successfully!",
        );
      },
      onError: (err: any) => {
        const msg =
          err.response?.data?.message ||
          "Failed to create external partner account.";
        setErrorMsg(msg);
        toast.error(msg);
      },
    });
  };

  // ----------------------------------------------------
  // BULK SPREADSHEET (CSV / XLSX) STATE & HANDLERS
  // ----------------------------------------------------
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedUserRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const bulkCreateMutation = useBulkCreateUser();

  const handleDownloadSampleCSV = () => {
    if (accountCategory === "external") {
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
      toast.info("Sample External Partners template (.csv) downloaded.");
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
      toast.info("Sample Internal Users template (.csv) downloaded.");
    }
  };

  const handleDownloadSampleXLSX = () => {
    if (accountCategory === "external") {
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
      toast.info("Sample External Partners template (.xlsx) downloaded.");
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
      toast.info("Sample Internal Users template (.xlsx) downloaded.");
    }
  };

  const parseSpreadsheetData = (
    sheetData: (string | number)[][],
    category: "internal" | "external",
  ): ParsedUserRow[] => {
    if (!sheetData || sheetData.length <= 1) {
      toast.error("Spreadsheet contains no records or header only.");
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
        let name = "";

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
      let name = "";

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

  const processFile = async (selectedFile: File) => {
    const fileName = selectedFile.name.toLowerCase();
    const isCSV = fileName.endsWith(".csv");
    const isXLSX = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isCSV && !isXLSX) {
      toast.error("Please upload a valid .csv or .xlsx file");
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        toast.error("Spreadsheet file contains no sheets.");
        setParsedRows([]);
        setIsParsing(false);
        return;
      }
      const worksheet = workbook.Sheets[firstSheetName];
      const sheetData = XLSX.utils.sheet_to_json<(string | number)[]>(
        worksheet,
        {
          header: 1,
          defval: "",
          blankrows: false,
        },
      );

      const parsed = parseSpreadsheetData(sheetData, accountCategory);
      setParsedRows(parsed);
    } catch (err) {
      console.error("Error parsing spreadsheet:", err);
      toast.error("Failed to read spreadsheet file. Please check file format.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, updatedRow: ParsedUserRow) => {
    setParsedRows((prev) => {
      const next = [...prev];
      next[index] = updatedRow;
      return next;
    });
    toast.success(`Entry #${index + 1} updated successfully.`);
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  const handleBulkSubmit = () => {
    const validMembers = parsedRows.filter((r) => r.isValid);
    if (validMembers.length === 0) {
      toast.error("No valid user entries to import.");
      return;
    }

    bulkCreateMutation.mutate(
      validMembers.map((m) => ({
        name: m.name,
        firstName: m.firstName,
        middleName: m.middleName,
        lastName: m.lastName,
        email: m.email,
        role: String(m.role),
        employeeId: m.employeeId,
        phoneNumber: m.phoneNumber,
        companyName: m.companyName,
        location: m.location,
      })),
      {
        onSuccess: (res: any) => {
          const createdCount =
            res?.data?.data?.users?.createdCount ||
            res?.createdCount ||
            validMembers.length;
          toast.success(
            accountCategory === "external"
              ? `Successfully registered ${createdCount} external review center account(s)!`
              : `Successfully registered ${createdCount} internal user account(s)!`,
          );
          navigate("/faculty-management");
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message || "Failed to process bulk import.";
          toast.error(msg);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Header & Back Navigation */}
      <div className="flex flex-col gap-3 sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-2 -mt-2 z-10 border-b border-border/80">
        <div className="flex items-center gap-2">
          <Link
            to="/faculty-management"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Directory
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <div
                className={`p-1.5 rounded-xl border ${
                  accountCategory === "external"
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                    : "bg-primary/10 text-primary border-primary/20"
                }`}
              >
                {accountCategory === "external" ? (
                  activeTab === "individual" ? (
                    <Building2 size={18} className="stroke-[2.5]" />
                  ) : (
                    <Users size={18} className="stroke-[2.5]" />
                  )
                ) : activeTab === "individual" ? (
                  <UserPlus size={18} className="stroke-[2.5]" />
                ) : (
                  <Users size={18} className="stroke-[2.5]" />
                )}
              </div>
              {accountCategory === "external"
                ? activeTab === "individual"
                  ? "Register Review Center Account"
                  : "Bulk Import Review Centers"
                : activeTab === "individual"
                  ? "Add New User"
                  : "Bulk Import Users"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {accountCategory === "external"
                ? activeTab === "individual"
                  ? "Create a dedicated external partner account for review center representatives."
                  : "Batch upload multiple review center partner accounts via CSV/Excel spreadsheet."
                : activeTab === "individual"
                  ? "Register an individual user account for academic access and management."
                  : "Batch upload multiple user accounts via CSV/Excel spreadsheet."}
            </p>
          </div>

          {/* ── Sub-tabs: Individual vs Bulk ── */}
          <div className="flex items-center p-1 bg-muted/60 border border-border/80 rounded-xl w-fit shrink-0">
            <button
              type="button"
              onClick={() => handleTabChange("individual")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "individual"
                  ? "bg-card text-foreground shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {accountCategory === "external" ? (
                <Building2 size={13} />
              ) : (
                <UserPlus size={13} />
              )}
              Individual
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("bulk")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "bulk"
                  ? "bg-card text-foreground shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users size={13} />
              Bulk
            </button>
          </div>
        </div>

        {/* ── Top-Level Account Type Category Switcher ── */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-1 mt-1">
          <button
            type="button"
            onClick={() => handleCategoryChange("internal")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              accountCategory === "internal"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Shield size={14} />
            Internal Account
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("external")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              accountCategory === "external"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Building2 size={14} />
            External Account
          </button>
        </div>
      </div>

      {/* ── EXTERNAL: TAB 1 (Individual) ── */}
      {accountCategory === "external" && activeTab === "individual" && (
        <AddExternalUserTab
          errorMsg={errorMsg}
          isPending={createMutation.isPending}
          onSubmitExternal={handleExternalSubmit}
          onCancel={() => navigate("/faculty-management")}
        />
      )}

      {/* ── EXTERNAL: TAB 2 (Bulk) ── */}
      {accountCategory === "external" && activeTab === "bulk" && (
        <AddBulkUserTab
          accountCategory="external"
          file={file}
          parsedRows={parsedRows}
          validCount={validCount}
          isParsing={isParsing}
          dragActive={dragActive}
          currentUserRole={currentUserRole}
          isPending={bulkCreateMutation.isPending}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
          onRemoveFile={() => {
            setFile(null);
            setParsedRows([]);
          }}
          onRemoveRow={handleRemoveRow}
          onUpdateRow={handleUpdateRow}
          onDownloadSampleCSV={handleDownloadSampleCSV}
          onDownloadSampleXLSX={handleDownloadSampleXLSX}
          onSubmit={handleBulkSubmit}
          onCancel={() => navigate("/faculty-management")}
        />
      )}

      {/* ── INTERNAL: TAB 1 (Individual) ── */}
      {accountCategory === "internal" && activeTab === "individual" && (
        <AddIndividualUserTab
          errorMsg={errorMsg}
          formData={formData}
          firstName={firstName}
          middleName={middleName}
          lastName={lastName}
          allowedRoles={allowedRoles}
          isPending={createMutation.isPending}
          onFirstNameChange={setFirstName}
          onMiddleNameChange={setMiddleName}
          onLastNameChange={setLastName}
          onFieldChange={handleFieldChange}
          onCategoryChange={(categoryIds) =>
            setFormData((prev) => ({
              ...prev,
              handledCategoryIds: categoryIds,
              handledSubjectIds: categoryIds,
            }))
          }
          onSubmit={handleIndividualSubmit}
          onCancel={() => navigate("/faculty-management")}
        />
      )}

      {/* ── INTERNAL: TAB 2 (Bulk) ── */}
      {accountCategory === "internal" && activeTab === "bulk" && (
        <AddBulkUserTab
          accountCategory="internal"
          file={file}
          parsedRows={parsedRows}
          validCount={validCount}
          isParsing={isParsing}
          dragActive={dragActive}
          currentUserRole={currentUserRole}
          isPending={bulkCreateMutation.isPending}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
          onRemoveFile={() => {
            setFile(null);
            setParsedRows([]);
          }}
          onRemoveRow={handleRemoveRow}
          onUpdateRow={handleUpdateRow}
          onDownloadSampleCSV={handleDownloadSampleCSV}
          onDownloadSampleXLSX={handleDownloadSampleXLSX}
          onSubmit={handleBulkSubmit}
          onCancel={() => navigate("/faculty-management")}
        />
      )}

      {/* Account Created & Credentials Modal */}
      <Dialog
        open={isCredentialsModalOpen}
        onOpenChange={(open) => {
          setIsCredentialsModalOpen(open);
          if (!open) {
            navigate("/faculty-management");
          }
        }}
      >
        <DialogContent className="max-w-md p-6 bg-card border border-border rounded-3xl shadow-2xl text-foreground font-sans">
          <DialogHeader className="items-center text-center space-y-2">
            <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="size-6 stroke-[2.5]" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-foreground tracking-tight">
                {createdCredentials?.role === "EXTERNAL"
                  ? "Review Center Account Ready"
                  : "User Account Ready"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Account registered successfully. Below are the assigned login credentials.
              </DialogDescription>
            </div>
          </DialogHeader>

          {createdCredentials && (
            <div className="space-y-4 my-2">
              {/* Credentials Box */}
              <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-2.5">
                {createdCredentials.companyName && (
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
                    <span className="text-muted-foreground font-semibold">
                      Partner Center:
                    </span>
                    <span className="font-bold text-foreground">
                      {createdCredentials.companyName}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">
                    Representative / Name:
                  </span>
                  <span className="font-bold text-foreground">
                    {createdCredentials.name}
                  </span>
                </div>
                {createdCredentials.employeeId && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-semibold">
                      Partner / Employee ID:
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {createdCredentials.employeeId}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">
                    Login Email:
                  </span>
                  <span className="font-bold text-foreground">
                    {createdCredentials.email}
                  </span>
                </div>
                {createdCredentials.temporaryPassword && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                    <span className="text-muted-foreground font-semibold">
                      Temporary Password:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                        {createdCredentials.temporaryPassword}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Email Delivery / Sandbox Info Note */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <strong className="font-bold">Email Dispatch Notice:</strong>{" "}
                  An onboarding email was triggered. If your email provider is in
                  sandbox/testing mode (e.g. Resend{" "}
                  <code className="font-mono text-[10px] bg-amber-500/20 px-1 py-0.5 rounded">
                    onboarding@resend.dev
                  </code>
                  ), delivery is restricted to the registered account owner. You
                  can copy the credentials below to deliver them directly to the
                  user.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const text = `BoardQuest Portal Access Credentials\n--------------------------------\nOrganization: ${createdCredentials.companyName || "BoardQuest"}\nName: ${createdCredentials.name}\nLogin Email / ID: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.temporaryPassword || "N/A"}\nPortal Link: ${createdCredentials.portalUrl || window.location.origin}`;
                    navigator.clipboard.writeText(text);
                    toast.success("Credentials copied to clipboard!");
                  }}
                  className="w-full flex items-center justify-center gap-2 cursor-pointer h-9 text-xs font-bold"
                >
                  <Copy className="size-3.5" />
                  Copy All Credentials & Portal Link
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setIsCredentialsModalOpen(false);
                    navigate("/faculty-management");
                  }}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer h-9 text-xs font-bold rounded-xl shadow-xs"
                >
                  Done & Back to User Directory
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const AddFacultyMember = AddUser;

