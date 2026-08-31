import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Upload,
  ArrowLeft,
  Calendar,
  Layers,
  Mail,
  User,
  GraduationCap,
  Tag,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useCandidates,
  useSchoolYears,
  useEnrollCandidate,
  useBulkEnrollCandidates,
} from "../api/useCandidates";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";
import {
  formatSchoolYearInput,
  normalizeSchoolYear,
  isValidSchoolYear,
} from "@/lib/utils";

// Helper to trigger download of CSV template
export function downloadStudentTemplateCSV() {
  const headers = "Full Name,Email,Student ID";
  const sampleRows = [
    "Maria Clara Santos,maria.santos@school.edu.ph,2023-0101",
    "Juan Dela Cruz,juan.delacruz@school.edu.ph,2023-0102",
    "Angela Reyes,angela.reyes@school.edu.ph,2023-0103",
  ];
  const csvString = [headers, ...sampleRows].join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "boardquest_student_enrollment_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function AddStudentsPage() {
  const { schoolYear: routeSchoolYear } = useParams<{ schoolYear?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useReviewCenterAuth();

  const activeTab: "individual" | "bulk" =
    searchParams.get("tab") === "bulk" ? "bulk" : "individual";

  const handleTabChange = (tab: "individual" | "bulk") => {
    setSearchParams({ tab });
  };

  const { data: candidatesData } = useCandidates();
  const { data: dbSchoolYears = [] } = useSchoolYears();

  const candidateSchoolYears = candidatesData?.schoolYears || [];

  const allSchoolYears = useMemo(() => {
    return Array.from(
      new Set([
        ...(routeSchoolYear ? [routeSchoolYear] : []),
        ...dbSchoolYears,
        ...candidateSchoolYears,
      ])
    ).sort((a, b) => b.localeCompare(a));
  }, [routeSchoolYear, dbSchoolYears, candidateSchoolYears]);

  // ── Global School Year state ──
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(
    routeSchoolYear || allSchoolYears[0] || ""
  );
  const [customSchoolYear, setCustomSchoolYear] = useState("");
  const [isCustomSchoolYear, setIsCustomSchoolYear] = useState(false);

  // ── Individual Form State ──
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [status, setStatus] = useState("ENROLLED");

  // ── Bulk Form State ──
  const [bulkRawText, setBulkRawText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const enrollMutation = useEnrollCandidate();
  const bulkMutation = useBulkEnrollCandidates();

  const finalSchoolYear = isCustomSchoolYear
    ? normalizeSchoolYear(customSchoolYear)
    : selectedSchoolYear.trim();

  // ── Parse Bulk Raw Text ──
  const parsedBulkStudents = useMemo(() => {
    if (!bulkRawText.trim()) return [];

    const lines = bulkRawText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const result: {
      name: string;
      email: string;
      schoolId?: string;
      isValid: boolean;
      error?: string;
    }[] = [];

    // Check if line 0 is a CSV header
    const startIndex =
      lines[0] &&
      (lines[0].toLowerCase().includes("full name") ||
        lines[0].toLowerCase().includes("name,email"))
        ? 1
        : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.includes("\t")
        ? line.split("\t").map((p) => p.trim())
        : line.split(",").map((p) => p.trim());

      const rowName = parts[0] || "";
      const rowEmail = parts[1] || "";
      const rowSchoolId = parts[2] || "";

      const isValidEmail = Boolean(rowEmail && rowEmail.includes("@"));
      const isValid = Boolean(rowName.trim() && isValidEmail);

      result.push({
        name: rowName,
        email: rowEmail,
        schoolId: rowSchoolId,
        isValid,
        error: !rowName
          ? "Missing Name"
          : !isValidEmail
          ? "Invalid Email"
          : undefined,
      });
    }

    return result;
  }, [bulkRawText]);

  const validBulkStudents = useMemo(() => {
    return parsedBulkStudents.filter((s) => s.isValid);
  }, [parsedBulkStudents]);

  // ── Handle CSV File Upload ──
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBulkRawText(content);
        toast.success(`Loaded ${file.name} successfully!`);
      }
    };
    reader.readAsText(file);
  };

  const handleClearFile = () => {
    setUploadedFileName(null);
    setBulkRawText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Handle Individual Submit ──
  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Student name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("A valid email address is required.");
      return;
    }
    if (!finalSchoolYear) {
      toast.error("School Year is required.");
      return;
    }
    if (!isValidSchoolYear(finalSchoolYear)) {
      toast.error("Please enter a valid school year format: YYYY-YYYY (e.g. 2026-2027).");
      return;
    }

    enrollMutation.mutate(
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        schoolId: schoolId.trim() || undefined,
        schoolYear: finalSchoolYear,
        status,
      },
      {
        onSuccess: () => {
          toast.success(
            `Enrolled ${name.trim()} into School Year ${finalSchoolYear}!`
          );
          navigate(`/candidates/${finalSchoolYear}`);
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to enroll student."
          );
        },
      }
    );
  };

  // ── Handle Bulk Submit ──
  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!finalSchoolYear) {
      toast.error("School Year is required.");
      return;
    }
    if (!isValidSchoolYear(finalSchoolYear)) {
      toast.error("Please enter a valid school year format: YYYY-YYYY (e.g. 2026-2027).");
      return;
    }

    if (validBulkStudents.length === 0) {
      toast.error(
        "Please provide at least one valid student line from the CSV file."
      );
      return;
    }

    bulkMutation.mutate(
      {
        schoolYear: finalSchoolYear,
        students: validBulkStudents.map((s) => ({
          name: s.name,
          email: s.email,
          schoolId: s.schoolId,
        })),
      },
      {
        onSuccess: (res: any) => {
          const count = res?.data?.enrolledCount ?? validBulkStudents.length;
          const skipped = res?.data?.skippedCount ?? 0;

          if (skipped > 0) {
            toast.success(
              `Added ${count} student(s) to ${finalSchoolYear}. (${skipped} duplicates skipped)`
            );
          } else {
            toast.success(
              `Successfully added ${count} student(s) to School Year ${finalSchoolYear}!`
            );
          }
          navigate(`/candidates/${finalSchoolYear}`);
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to bulk add students."
          );
        },
      }
    );
  };

  const isPending = enrollMutation.isPending || bulkMutation.isPending;
  const backTarget = routeSchoolYear
    ? `/candidates/${routeSchoolYear}`
    : "/candidates";

  return (
    <div className="space-y-6 max-w-4xl w-full mx-auto font-sans pb-12">
      {/* ── Top Navigation & Header ── */}
      <div className="space-y-2 pb-3 border-b border-border">
        <Link
          to={backTarget}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer mb-1"
        >
          <ArrowLeft size={13} />
          <span>
            {routeSchoolYear
              ? `Back to S.Y. ${routeSchoolYear}`
              : "Back to School Years"}
          </span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
              <UserPlus className="size-6 text-primary shrink-0" />
              <span>Add Enrolled Students</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enroll MedTech students into {user?.companyName || "your review center"} individually or via bulk spreadsheet import.
            </p>
          </div>

          {/* School Year Selector badge */}
          <div className="flex items-center gap-2 bg-card p-1.5 rounded-xl border border-border self-start sm:self-auto">
            <Calendar className="size-3.5 text-primary ml-1.5 shrink-0" />
            <Select
              value={isCustomSchoolYear ? "CUSTOM" : selectedSchoolYear}
              onValueChange={(val) => {
                if (val === "CUSTOM") {
                  setIsCustomSchoolYear(true);
                } else {
                  setIsCustomSchoolYear(false);
                  setSelectedSchoolYear(val);
                }
              }}
              disabled={isPending}
            >
              <SelectTrigger className="h-7 text-xs font-bold border-0 shadow-none bg-transparent gap-1.5">
                <SelectValue placeholder="School Year" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {allSchoolYears.map((sy) => (
                  <SelectItem key={sy} value={sy} className="text-xs font-semibold">
                    S.Y. {sy}
                  </SelectItem>
                ))}
                <SelectItem value="CUSTOM" className="text-xs font-semibold text-primary">
                  + Custom S.Y...
                </SelectItem>
              </SelectContent>
            </Select>

            {isCustomSchoolYear && (
              <Input
                value={customSchoolYear}
                onChange={(e) => setCustomSchoolYear(formatSchoolYearInput(e.target.value))}
                onBlur={() => setCustomSchoolYear(normalizeSchoolYear(customSchoolYear))}
                placeholder="2026-2027"
                maxLength={9}
                className="h-7 w-28 text-xs font-mono rounded-lg bg-background border-border"
                disabled={isPending}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Two-Tab Navigation Bar ── */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => handleTabChange("individual")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "individual"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <User className="size-4" />
          <span>Individual Student</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("bulk")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "bulk"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <FileSpreadsheet className="size-4" />
          <span>Bulk Import</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1: INDIVIDUAL STUDENT FORM
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "individual" && (
        <Card className="rounded-2xl border-border bg-card shadow-xs overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-border/70 bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="size-4 text-primary" />
              Student Information
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter the student's personal details and enrollment status.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleIndividualSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  <span>Full Name</span>
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Clara Santos"
                  className="h-9.5 text-xs rounded-xl bg-background border-border"
                  disabled={isPending}
                />
              </div>

              {/* Email & Student ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span>Email Address</span>
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@school.edu.ph"
                    className="h-9.5 text-xs rounded-xl bg-background border-border"
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <GraduationCap className="size-3.5 text-muted-foreground" />
                    <span>Student ID (Optional)</span>
                  </label>
                  <Input
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    placeholder="e.g. 2023-01984"
                    className="h-9.5 text-xs rounded-xl bg-background border-border"
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Tag className="size-3.5 text-muted-foreground" />
                  <span>Status</span>
                </label>
                <Select
                  value={status}
                  onValueChange={setStatus}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-9.5 text-xs rounded-xl bg-background border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="ENROLLED" className="text-xs">
                      Enrolled (Active Review)
                    </SelectItem>
                    <SelectItem value="COMPLETED" className="text-xs">
                      Completed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(backTarget)}
                  className="h-9 px-4 text-xs rounded-xl border-border"
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-9 px-5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1.5" />
                      Enrolling...
                    </>
                  ) : (
                    "Enroll Student"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2: BULK IMPORT WITH DOWNLOADABLE CSV/EXCEL TEMPLATE
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "bulk" && (
        <div className="space-y-5">
          {/* Download Template Banner Card */}
          <Card className="rounded-2xl border-primary/30 bg-primary/5 shadow-2xs">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="size-5 text-primary shrink-0" />
                  <h3 className="text-sm font-bold text-foreground">
                    Download Enrollment Template
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                  Download our pre-formatted spreadsheet template with the required columns:{" "}
                  <span className="font-semibold text-foreground">Full Name, Email, Student ID</span>. Fill it out and upload it below.
                </p>
              </div>

              <Button
                type="button"
                onClick={downloadStudentTemplateCSV}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-4 h-9 rounded-xl shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Download size={14} />
                <span>Download CSV Template</span>
              </Button>
            </CardContent>
          </Card>

          {/* Bulk Upload Form */}
          <Card className="rounded-2xl border-border bg-card shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-border/70 bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Upload className="size-4 text-primary" />
                Upload Students CSV
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Upload your completed CSV file to enroll students in bulk.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Drag & Drop File Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5 text-muted-foreground" />
                  <span>Upload CSV File</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-file-upload"
                />

                {uploadedFileName ? (
                  <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="size-5 text-primary" />
                      <div>
                        <span className="text-xs font-bold text-foreground">
                          {uploadedFileName}
                        </span>
                        <p className="text-[10.5px] text-muted-foreground">
                          {parsedBulkStudents.length} lines parsed
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFile}
                      className="text-destructive hover:bg-destructive/10 h-7 px-2 text-xs rounded-lg"
                    >
                      <Trash2 size={13} className="mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="csv-file-upload"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-primary/50 rounded-2xl cursor-pointer bg-muted/10 hover:bg-muted/30 transition-all text-center space-y-2 group"
                  >
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload className="size-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">
                        Click to browse or drag & drop CSV file
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Accepts .csv files (Comma-separated values)
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {/* Live Preview Table */}
              {parsedBulkStudents.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Parsed Preview ({validBulkStudents.length} Valid / {parsedBulkStudents.length} Total)</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      School Year: S.Y. {finalSchoolYear}
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-border rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-muted/50 sticky top-0 border-b border-border text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Full Name</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Student ID</th>
                          <th className="px-3 py-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {parsedBulkStudents.map((item, idx) => (
                          <tr
                            key={idx}
                            className={item.isValid ? "hover:bg-muted/20" : "bg-destructive/5"}
                          >
                            <td className="px-3 py-2 text-muted-foreground text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-2 font-bold text-foreground">
                              {item.name || "—"}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {item.email || "—"}
                            </td>
                            <td className="px-3 py-2 font-mono text-[11px]">
                              {item.schoolId || "—"}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {item.isValid ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                  Valid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-md">
                                  {item.error || "Error"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(backTarget)}
                  className="h-9 px-4 text-xs rounded-xl border-border"
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleBulkSubmit}
                  disabled={isPending || validBulkStudents.length === 0}
                  className="h-9 px-5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1.5" />
                      Adding Students...
                    </>
                  ) : (
                    `Enroll ${validBulkStudents.length || ""} Student${validBulkStudents.length === 1 ? "" : "s"}`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AddStudentsPage;
