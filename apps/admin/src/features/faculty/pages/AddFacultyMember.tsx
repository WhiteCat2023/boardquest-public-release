import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { UserPlus, Users, ArrowLeft } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { UserRole } from "@/types/question";
import type { RoleType, CreateFacultyPayload, ParsedFacultyRow } from "@/features/faculty";
import { getAllowedRolesToCreate } from "@/features/faculty/utils/facultyUtils";
import {

  useCreateFaculty,
  useBulkCreateFaculty,
} from "@/features/faculty";
import AddIndividualFacultyTab from "../components/AddIndividualFacultyTab";
import AddBulkFacultyTab from "../components/AddBulkFacultyTab";

export default function AddFacultyMember() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { auth } = useAuth();
  const currentUserRole = (auth as any)?.data?.user?.role as RoleType;

  // Active Tab: "individual" | "bulk"
  const initialTab = searchParams.get("tab") === "bulk" ? "bulk" : "individual";
  const [activeTab, setActiveTab] = useState<"individual" | "bulk">(initialTab);

  const handleTabChange = (tab: "individual" | "bulk") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ----------------------------------------------------
  // INDIVIDUAL FORM STATE & HANDLERS
  // ----------------------------------------------------
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formData, setFormData] = useState<CreateFacultyPayload>({
    employeeId: "",
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: UserRole.TEACHER as RoleType,
  });
  const [errorMsg, setErrorMsg] = useState("");

  const createMutation = useCreateFaculty();

  useEffect(() => {
    if (currentUserRole === UserRole.SUPERADMIN) {
      setFormData((prev) => ({ ...prev, role: UserRole.ADMIN }));
    } else if (currentUserRole === UserRole.ADMIN) {
      setFormData((prev) => ({ ...prev, role: UserRole.TEAMLEAD }));
    } else {
      setFormData((prev) => ({ ...prev, role: UserRole.TEACHER }));
    }
  }, [currentUserRole]);

  const allowedRoles = getAllowedRolesToCreate(currentUserRole);

  const handleFieldChange = (field: keyof CreateFacultyPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

    const payload: CreateFacultyPayload = {
      ...formData,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: fullName,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Faculty member registered successfully!");
        navigate("/faculty-management");
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || "Failed to register faculty member.";
        setErrorMsg(msg);
        toast.error(msg);
      },
    });
  };

  // ----------------------------------------------------
  // BULK CSV FORM STATE & HANDLERS
  // ----------------------------------------------------
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedFacultyRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const bulkCreateMutation = useBulkCreateFaculty();

  const downloadSampleCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "FirstName,LastName,Email,Role,EmployeeID,PhoneNumber\n" +
      "Jane,Doe,jane.doe@university.edu,TEACHER,EMP-2026-001,09171234567\n" +
      "Mark,Smith,mark.smith@university.edu,TEAMLEAD,EMP-2026-002,09187654321\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "boardquest_faculty_import_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info("Sample Faculty CSV template downloaded.");
  };

  const parseCSVText = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
    if (lines.length <= 1) {
      toast.error("CSV file contains no records or header only.");
      return [];
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z]/g, ""));
    const firstNameIdx = headers.findIndex((h) => h.includes("first") || h === "fname");
    const lastNameIdx = headers.findIndex((h) => h.includes("last") || h === "lname");
    const nameIdx = headers.findIndex((h) => h.includes("name") && !h.includes("first") && !h.includes("last"));
    const emailIdx = headers.findIndex((h) => h.includes("email"));
    const roleIdx = headers.findIndex((h) => h.includes("role"));
    const empIdIdx = headers.findIndex((h) => h.includes("employee") || h.includes("empid") || h.includes("id"));
    const phoneIdx = headers.findIndex((h) => h.includes("phone") || h.includes("number"));

    const rows: ParsedFacultyRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].trim();
      if (!currentLine) continue;

      const values = currentLine.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
      
      let firstName = "";
      let lastName = "";
      let name = "";

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

      const email = emailIdx !== -1 && values[emailIdx] ? values[emailIdx] : (values[1] || "");
      const role = roleIdx !== -1 && values[roleIdx] ? values[roleIdx].toUpperCase() : (values[2] ? values[2].toUpperCase() : "TEACHER");
      const employeeId = empIdIdx !== -1 && values[empIdIdx] ? values[empIdIdx] : (values[3] || "");
      const phoneNumber = phoneIdx !== -1 && values[phoneIdx] ? values[phoneIdx] : (values[4] || "");

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
        name,
        firstName,
        lastName,
        email,
        role: ["SUPERADMIN", "ADMIN", "TEAMLEAD", "TEACHER"].includes(role) ? role : "TEACHER",
        employeeId: employeeId || undefined,
        phoneNumber: phoneNumber || undefined,
        isValid,
        validationError,
      });
    }

    return rows;
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please upload a valid .csv file");
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = parseCSVText(text);
      setParsedRows(parsed);
      setIsParsing(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read CSV file.");
      setIsParsing(false);
    };
    reader.readAsText(selectedFile);
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

  const validCount = parsedRows.filter((r) => r.isValid).length;

  const handleBulkSubmit = () => {
    const validMembers = parsedRows.filter((r) => r.isValid);
    if (validMembers.length === 0) {
      toast.error("No valid faculty entries to import.");
      return;
    }

    bulkCreateMutation.mutate(
      validMembers.map((m) => ({
        name: m.name,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        role: m.role,
        employeeId: m.employeeId,
        phoneNumber: m.phoneNumber,
      })),
      {
        onSuccess: (res: any) => {
          const createdCount = res?.createdCount || validMembers.length;
          toast.success(`Successfully registered ${createdCount} faculty member(s)!`);
          navigate("/faculty-management");
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || "Failed to process bulk faculty import.";
          toast.error(msg);
        },
      }
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
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Directory
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
                {activeTab === "individual" ? (
                  <UserPlus size={18} className="stroke-[2.5]" />
                ) : (
                  <Users size={18} className="stroke-[2.5]" />
                )}
              </div>
              {activeTab === "individual" ? "Add New Faculty Member" : "Bulk Import Faculty Members"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeTab === "individual"
                ? "Register an individual faculty member account for academic access and management."
                : "Batch upload multiple faculty accounts via CSV spreadsheet."}
            </p>
          </div>

          {/* ── Segmented Pill Tabs: Add User(individual) & Add Users(bulk) ── */}
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
              <UserPlus size={13} />
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
      </div>

      {/* ── TAB 1: Add User (individual) ── */}
      {activeTab === "individual" && (
        <AddIndividualFacultyTab
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
            setFormData((prev) => ({ ...prev, handledCategoryIds: categoryIds }))
          }
          onSubmit={handleIndividualSubmit}
          onCancel={() => navigate("/faculty-management")}
        />
      )}

      {/* ── TAB 2: Add Users (bulk) ── */}
      {activeTab === "bulk" && (
        <AddBulkFacultyTab
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
          onDownloadSampleCSV={downloadSampleCSV}
          onSubmit={handleBulkSubmit}
          onCancel={() => navigate("/faculty-management")}
        />
      )}
    </div>
  );
}
