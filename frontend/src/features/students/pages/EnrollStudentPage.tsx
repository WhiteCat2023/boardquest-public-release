import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import {
  ArrowLeft,
  UserPlus,
  Users,
  AlertCircle,
  Sparkles,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  Mail,
  HelpCircle,
  RefreshCw,
  MapPin,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useCreateStudent, useBulkCreateStudents } from "@/features/students";

interface ParsedStudentRow {
  name: string;
  email: string;
  location?: string;
  isValid: boolean;
  validationError?: string;
}

export default function EnrollStudentPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { auth } = useAuth();
  const currentUserRole = (auth as any)?.data?.user?.role;

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
  const createStudentMutation = useCreateStudent();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "Philippines",
    password: "",
    confirmPassword: "",
  });

  const handleGeneratePassword = () => {
    const randomPass = `BQ-STU-${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setFormData((prev) => ({
      ...prev,
      password: randomPass,
      confirmPassword: randomPass,
    }));
    toast.info(`Generated temporary password: ${randomPass}`);
  };

  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and Email are required.");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    createStudentMutation.mutate(
      {
        name: formData.name.trim(),
        email: formData.email.trim(),
        location: formData.location.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      },
      {
        onSuccess: () => {
          toast.success("Student account enrolled successfully!");
          navigate("/student-management");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to create student account.");
        },
      }
    );
  };

  // ----------------------------------------------------
  // BULK CSV FORM STATE & HANDLERS
  // ----------------------------------------------------
  const bulkCreateMutation = useBulkCreateStudents();
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const downloadSampleCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Email,Location\n" +
      "Alexander Wright,awright@student.university.edu,Manila\n" +
      "Beatriz Santos,bsantos@student.university.edu,Cebu\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "boardquest_student_import_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info("Sample Student CSV template downloaded.");
  };

  const parseCSVText = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
    if (lines.length <= 1) {
      toast.error("CSV file contains no records or header only.");
      return [];
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z]/g, ""));
    const nameIdx = headers.findIndex((h) => h.includes("name"));
    const emailIdx = headers.findIndex((h) => h.includes("email"));
    const locationIdx = headers.findIndex((h) => h.includes("location") || h.includes("city"));

    const rows: ParsedStudentRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].trim();
      if (!currentLine) continue;

      const values = currentLine.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
      const name = nameIdx !== -1 && values[nameIdx] ? values[nameIdx] : (values[0] || "");
      const email = emailIdx !== -1 && values[emailIdx] ? values[emailIdx] : (values[1] || "");
      const location = locationIdx !== -1 && values[locationIdx] ? values[locationIdx] : (values[2] || "");

      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      let isValid = true;
      let validationError = "";

      if (!name) {
        isValid = false;
        validationError = "Missing Name";
      } else if (!email || !isValidEmail) {
        isValid = false;
        validationError = "Invalid Email";
      }

      rows.push({
        name,
        email,
        location: location || "Philippines",
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
    setParsedRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleBulkSubmit = () => {
    const validStudents = parsedRows.filter((r) => r.isValid);
    if (validStudents.length === 0) {
      toast.error("No valid student entries to import.");
      return;
    }

    bulkCreateMutation.mutate(
      validStudents.map((s) => ({
        name: s.name,
        email: s.email,
        location: s.location,
      })),
      {
        onSuccess: (res: any) => {
          const result = res.data?.data;
          toast.success(
            `Successfully enrolled ${result?.createdCount || validStudents.length} student(s)! Credentials sent to emails.`
          );
          if (result?.skippedCount > 0) {
            toast.warning(`${result.skippedCount} entry/entries skipped due to existing email.`);
          }
          navigate("/student-management");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to import student accounts.");
        },
      }
    );
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Header & Back Navigation */}
      <div className="flex flex-col gap-3 sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-2 -mt-2 z-10 border-b border-border/80">
        <div className="flex items-center gap-2">
          <Link
            to="/student-management"
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
              {activeTab === "individual" ? "Enroll New Student" : "Bulk Enroll Students"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeTab === "individual"
                ? "Register an individual student account for online practice exams and evaluation."
                : "Batch upload multiple student accounts via CSV spreadsheet."}
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
              Add User(individual)
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
              Add Users(bulk)
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB 1: Add User (individual) ── */}
      {activeTab === "individual" && (
        <form onSubmit={handleIndividualSubmit} className="flex flex-col gap-5">
          <div className="bg-card border border-border/80 rounded-2xl p-4 md:p-6 shadow-xs flex flex-col gap-4 font-sans text-foreground">
            <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
              <div className="p-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
                <UserPlus size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Student Identity & Account Security</h2>
                <p className="text-xs text-muted-foreground">Enter the student's primary details and set initial login credentials.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  Full Name <span className="text-primary">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Alexander Wright"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={12} className="text-muted-foreground" />
                  Email Address <span className="text-primary">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="e.g. alexander@student.university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
                  required
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={12} className="text-muted-foreground" />
                  Location / Region
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Philippines"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Lock size={12} className="text-muted-foreground" />
                    Password <span className="text-primary">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} /> Auto-Generate
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="Enter account password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={12} className="text-muted-foreground" />
                  Confirm Password <span className="text-primary">*</span>
                </Label>
                <Input
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/student-management")}
              disabled={createStudentMutation.isPending}
              className="cursor-pointer border-border hover:bg-accent text-foreground font-semibold px-4 py-2 rounded-lg h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createStudentMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-semibold px-6 py-2 rounded-lg h-9 text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              {createStudentMutation.isPending ? (
                <span className="inline-block animate-spin border-2 border-primary-foreground border-t-transparent rounded-full w-3.5 h-3.5" />
              ) : (
                <Sparkles size={14} />
              )}
              Enroll Student Account
            </Button>
          </div>
        </form>
      )}

      {/* ── TAB 2: Add Users (bulk) ── */}
      {activeTab === "bulk" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
          {/* Main Bulk Upload Card */}
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            {/* Header Bar */}
            <div className="p-4 border-b border-border/60 flex items-center justify-between gap-3 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <FileSpreadsheet size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Bulk CSV Student Importer</h2>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Upload a .csv spreadsheet containing student accounts.
                  </p>
                </div>
              </div>

              <Badge variant="outline" className="text-[10px] font-bold uppercase px-2 py-0.5">
                {currentUserRole || "ADMIN"}
              </Badge>
            </div>

            {/* Upload Zone & Table */}
            <div className="p-5 flex flex-col gap-4">
              {!file ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    dragActive
                      ? "border-primary bg-primary/10 scale-[0.99]"
                      : "border-border/80 bg-muted/30 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <div className="p-3 bg-card rounded-xl border border-border/80 shadow-2xs text-primary mb-2">
                    <Upload size={22} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Upload Student CSV File</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
                    Drag and drop your spreadsheet here or click to browse files (.csv)
                  </p>

                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File summary bar */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 border border-border/80 rounded-xl text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet size={18} className="text-primary" />
                      <div>
                        <p className="font-bold text-foreground">{file.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {parsedRows.length} entries &bull;{" "}
                          <strong className="text-emerald-600 dark:text-emerald-400">
                            {validCount} valid
                          </strong>
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setParsedRows([]);
                      }}
                      className="text-xs font-semibold border-border hover:bg-accent rounded-lg h-7 px-2.5 cursor-pointer"
                    >
                      Change File
                    </Button>
                  </div>

                  {/* Table Preview */}
                  {isParsing ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <div className="animate-spin inline-block border-2 border-primary border-t-transparent rounded-full w-5 h-5 mb-2" />
                      <p className="text-xs font-medium">Parsing CSV spreadsheet data...</p>
                    </div>
                  ) : parsedRows.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground text-xs">
                      No valid student rows found in file.
                    </div>
                  ) : (
                    <div className="border border-border/80 rounded-xl overflow-hidden shadow-2xs bg-card">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-muted/80 text-muted-foreground font-bold border-b border-border/80 sticky top-0 backdrop-blur-xs">
                            <tr>
                              <th className="py-2 px-3">Status</th>
                              <th className="py-2 px-3">Name</th>
                              <th className="hidden sm:table-cell py-2 px-3">Email</th>
                              <th className="hidden sm:table-cell py-2 px-3">Location</th>
                              <th className="py-2 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {parsedRows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                <td className="py-2 px-3">
                                  {row.isValid ? (
                                    <Badge
                                      variant="outline"
                                      className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9.5px] font-bold gap-1 px-1.5 py-0"
                                    >
                                      <CheckCircle2 size={10} /> Valid
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="bg-destructive/10 text-destructive border-destructive/20 text-[9.5px] font-bold gap-1 px-1.5 py-0"
                                    >
                                      <AlertCircle size={10} /> {row.validationError || "Invalid"}
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-2 px-3 font-semibold text-foreground">
                                  {row.name || <span className="text-muted-foreground italic">Missing</span>}
                                </td>
                                <td className="hidden sm:table-cell py-2 px-3 text-muted-foreground">{row.email}</td>
                                <td className="hidden sm:table-cell py-2 px-3 text-muted-foreground">
                                  {row.location || "Philippines"}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveRow(idx)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 w-6 p-0 rounded-md cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/80">
                    <div className="text-xs text-muted-foreground font-medium">
                      Ready to process <strong className="text-foreground">{validCount}</strong> valid account(s)
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/student-management")}
                        disabled={bulkCreateMutation.isPending}
                        className="cursor-pointer border-border hover:bg-accent text-foreground font-semibold px-4 py-2 rounded-lg h-9 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleBulkSubmit}
                        disabled={validCount === 0 || bulkCreateMutation.isPending}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-semibold px-6 py-2 rounded-lg h-9 text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {bulkCreateMutation.isPending ? (
                          <span className="inline-block animate-spin border-2 border-primary-foreground border-t-transparent rounded-full w-3.5 h-3.5" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        Enroll {validCount} Student(s)
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Info Sidebar Card */}
          <div className="space-y-4">
            <Card className="border border-border/80 shadow-2xs bg-card rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/60 p-4">
                <CardTitle className="text-xs font-bold flex items-center gap-2 text-foreground">
                  <HelpCircle size={15} className="text-primary" />
                  CSV Column Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs text-muted-foreground space-y-2.5 font-medium">
                <p className="text-[11px]">Header row must include:</p>
                <ul className="space-y-1.5 list-disc list-inside text-foreground/90 bg-muted/30 p-2.5 rounded-xl border border-border/60 text-[11px]">
                  <li>
                    <strong className="text-foreground font-bold">Name</strong> (Required)
                  </li>
                  <li>
                    <strong className="text-foreground font-bold">Email</strong> (Required)
                  </li>
                  <li>
                    <strong className="text-foreground font-bold">Location</strong> (Optional)
                  </li>
                </ul>

                <Button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="w-full mt-2 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl gap-2 cursor-pointer shadow-2xs h-9"
                >
                  <Download size={14} />
                  Download Sample CSV Template
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 bg-primary/5 shadow-2xs rounded-2xl p-4">
              <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
                <Mail size={15} />
                <span>Credential Dispatch</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Login credentials and portal access details will automatically be emailed to each enrolled student.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
