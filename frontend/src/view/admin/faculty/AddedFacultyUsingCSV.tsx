import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, Trash2, Mail, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useBulkCreateFaculty, useDepartments } from "./hooks/useFaculty";
import useAuth from "@/hooks/useAuth";

interface ParsedFacultyRow {
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  phoneNumber?: string;
  departmentName?: string;
  isValid: boolean;
  validationError?: string;
}

export default function AddedFacultyUsingCSV() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const currentUserRole = (auth as any)?.data?.user?.role;

  const { data: departments = [] } = useDepartments();
  const bulkCreateMutation = useBulkCreateFaculty();

  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedFacultyRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const downloadSampleCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Email,Role,EmployeeID,PhoneNumber,DepartmentName\n" +
      "Dr. Jane Doe,jane.doe@university.edu,TEACHER,EMP-2026-001,09171234567,Medical Technology\n" +
      "Prof. Mark Smith,mark.smith@university.edu,TEAMLEAD,EMP-2026-002,09187654321,Pharmacy\n";
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
    const nameIdx = headers.findIndex((h) => h.includes("name"));
    const emailIdx = headers.findIndex((h) => h.includes("email"));
    const roleIdx = headers.findIndex((h) => h.includes("role"));
    const empIdIdx = headers.findIndex((h) => h.includes("employee") || h.includes("empid") || h.includes("id"));
    const phoneIdx = headers.findIndex((h) => h.includes("phone") || h.includes("number"));
    const deptIdx = headers.findIndex((h) => h.includes("department") || h.includes("dept"));

    const rows: ParsedFacultyRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].trim();
      if (!currentLine) continue;

      const values = currentLine.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
      const name = nameIdx !== -1 && values[nameIdx] ? values[nameIdx] : (values[0] || "");
      const email = emailIdx !== -1 && values[emailIdx] ? values[emailIdx] : (values[1] || "");
      const role = roleIdx !== -1 && values[roleIdx] ? values[roleIdx].toUpperCase() : (values[2] ? values[2].toUpperCase() : "TEACHER");
      const employeeId = empIdIdx !== -1 && values[empIdIdx] ? values[empIdIdx] : (values[3] || "");
      const phoneNumber = phoneIdx !== -1 && values[phoneIdx] ? values[phoneIdx] : (values[4] || "");
      const departmentName = deptIdx !== -1 && values[deptIdx] ? values[deptIdx] : (values[5] || "");

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
        role: ["SUPERADMIN", "ADMIN", "TEAMLEAD", "TEACHER"].includes(role) ? role : "TEACHER",
        employeeId: employeeId || undefined,
        phoneNumber: phoneNumber || undefined,
        departmentName: departmentName || undefined,
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

  const handleImport = () => {
    const validMembers = parsedRows.filter((r) => r.isValid);
    if (validMembers.length === 0) {
      toast.error("No valid faculty entries to import.");
      return;
    }

    bulkCreateMutation.mutate(
      validMembers.map((m) => ({
        name: m.name,
        email: m.email,
        role: m.role,
        employeeId: m.employeeId,
        phoneNumber: m.phoneNumber,
        departmentName: m.departmentName,
      })),
      {
        onSuccess: (res: any) => {
          const result = res.data?.data;
          toast.success(
            `Successfully created ${result?.createdCount || validMembers.length} faculty member(s)! Login credentials have been emailed.`
          );
          if (result?.skippedCount > 0) {
            toast.warning(`${result.skippedCount} entry/entries skipped due to existing email or role restrictions.`);
          }
          navigate("/faculty-management");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to import faculty members.");
        },
      }
    );
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-300 font-sans bg-background text-foreground">
      {/* Back button */}
      <button
        onClick={() => navigate("/faculty-management")}
        className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={16} />
        Back to Faculty Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
        {/* Main Bulk Upload Card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col">
          {/* Header Bar */}
          <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <FileSpreadsheet size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">Bulk Faculty Account Importer</h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Import faculty members via CSV and automatically dispatch login credential emails.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end text-xs text-muted-foreground font-medium border-l-2 md:border-l-0 md:border-r-2 border-primary/30 pl-3 md:pl-0 md:pr-3 py-0.5">
              <span className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-wider">Manager Role</span>
              <span className="text-foreground font-bold text-sm">{currentUserRole || "ADMIN"}</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 flex flex-col gap-6">
            {!file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
                  dragActive ? "border-primary bg-primary/10 scale-[0.99]" : "border-border bg-muted/40 hover:border-primary/40 hover:bg-primary/10"
                }`}
              >
                <div className="p-4 bg-card rounded-2xl border border-border shadow-xs text-primary mb-3">
                  <Upload size={28} />
                </div>
                <h3 className="text-base font-bold text-foreground">Upload Faculty CSV File</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Drag and drop your spreadsheet here or click to browse files (.csv format)
                </p>

                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                <Button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="mt-6 text-xs font-semibold bg-card text-primary border border-primary/30 hover:bg-primary/10 rounded-xl gap-2 cursor-pointer shadow-2xs"
                >
                  <Download size={14} />
                  Download Sample CSV Template
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* File summary bar */}
                <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet size={22} className="text-primary" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {parsedRows.length} total entries parsed &bull; <strong className="text-emerald-600 dark:text-emerald-400">{validCount} valid</strong>
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setParsedRows([]);
                    }}
                    className="text-xs font-semibold border-border hover:bg-accent rounded-xl cursor-pointer"
                  >
                    Upload Different File
                  </Button>
                </div>

                {/* Table Preview */}
                {isParsing ? (
                  <div className="py-16 text-center text-muted-foreground">
                    <div className="animate-spin inline-block border-3 border-primary border-t-transparent rounded-full w-7 h-7 mb-3" />
                    <p className="text-sm font-medium">Parsing CSV spreadsheet data...</p>
                  </div>
                ) : parsedRows.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">No valid faculty rows found in file.</div>
                ) : (
                  <div className="border border-border rounded-2xl overflow-hidden shadow-xs bg-card">
                    <div className="max-h-80 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/80 text-muted-foreground font-bold border-b border-border sticky top-0 backdrop-blur-xs">
                          <tr>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Name</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Role</th>
                            <th className="py-3 px-4">Department</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {parsedRows.map((row, idx) => (
                            <tr key={idx} className={row.isValid ? "hover:bg-accent/40" : "bg-destructive/10"}>
                              <td className="py-2.5 px-4">
                                {row.isValid ? (
                                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] gap-1">
                                    <CheckCircle2 size={12} /> Ready
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] gap-1">
                                    <AlertCircle size={12} /> {row.validationError}
                                  </Badge>
                                )}
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-foreground">{row.name || "—"}</td>
                              <td className="py-2.5 px-4 text-muted-foreground font-mono text-[11px]">{row.email || "—"}</td>
                              <td className="py-2.5 px-4">
                                <Badge variant="outline" className="text-[10px] uppercase font-bold bg-muted text-muted-foreground border-border">
                                  {row.role}
                                </Badge>
                              </td>
                              <td className="py-2.5 px-4 text-muted-foreground">{row.departmentName || "General"}</td>
                              <td className="py-2.5 px-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveRow(idx)}
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-lg cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail size={16} className="text-primary" />
                    <span>Credentials (unique temp passwords) will be auto-emailed upon import</span>
                  </div>

                  <Button
                    type="button"
                    disabled={bulkCreateMutation.isPending || validCount === 0}
                    onClick={handleImport}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-semibold px-6 h-11 cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    {bulkCreateMutation.isPending ? "Importing Accounts & Emailing..." : `Import ${validCount} Faculty Account(s)`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Info Sidebar Card */}
        <div className="flex flex-col gap-6">
          <Card className="bg-card border border-border rounded-3xl p-6 shadow-xs text-foreground">
            <CardHeader className="p-0 space-y-1 mb-4">
              <div className="flex items-center gap-2 text-primary">
                <HelpCircle size={18} />
                <CardTitle className="text-base font-bold text-foreground">CSV Import Instructions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-4 text-xs text-muted-foreground leading-relaxed">
              <p>
                Follow the format below when preparing your faculty batch CSV file to ensure accurate account creation:
              </p>
              <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-1 font-mono text-[11px] text-foreground">
                <p className="font-bold text-primary">Required Columns:</p>
                <p>&bull; Name (e.g. Dr. Jane Doe)</p>
                <p>&bull; Email (e.g. jane@univ.edu)</p>
                <div className="pt-2 font-bold text-muted-foreground">Optional Columns:</div>
                <p>&bull; Role (TEACHER, TEAMLEAD)</p>
                <p>&bull; EmployeeID (e.g. EMP-2026-001)</p>
                <p>&bull; PhoneNumber (e.g. 09171234567)</p>
                <p>&bull; DepartmentName (e.g. Pharmacy)</p>
              </div>

              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-[11px] text-foreground space-y-1">
                <p className="font-bold text-primary flex items-center gap-1">
                  <Mail size={13} /> Credential Delivery:
                </p>
                <p>
                  A unique 8-character temporary password (e.g. <code className="bg-card px-1 py-0.5 rounded text-primary border border-primary/20 font-bold">BQ-8A3X9K</code>) is generated for each member and emailed directly to their address.
                </p>
              </div>

              <Button
                type="button"
                onClick={downloadSampleCSV}
                className="w-full bg-muted hover:bg-accent text-foreground border border-border text-xs font-semibold rounded-xl h-10 gap-2 cursor-pointer mt-2"
              >
                <Download size={14} />
                Download Sample CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
