import { useState } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useBulkCreateFaculty } from "@/features/faculty";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const facultyRowSchema = z
  .object({
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().min(1, "Missing Email").email("Invalid Email"),
    role: z
      .enum(["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"])
      .default("TEACHER"),
    employeeId: z.string().optional(),
    phoneNumber: z.string().optional(),
  })
  .refine(
    (data) =>
      Boolean(
        (data.name && data.name.trim().length > 0) ||
          (data.firstName && data.firstName.trim().length > 0) ||
          (data.lastName && data.lastName.trim().length > 0)
      ),
    { message: "Missing Name" }
  );

interface ParsedFacultyRow {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  employeeId?: string;
  phoneNumber?: string;
  isValid: boolean;
  validationError?: string;
}

interface BulkImportFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkImportFacultyModal({
  isOpen,
  onClose,
}: BulkImportFacultyModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedFacultyRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
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
    const lines = text
      .split(/\r\n|\n/)
      .filter((line) => line.trim().length > 0);
    if (lines.length <= 1) {
      toast.error("CSV file contains no records or header only.");
      return [];
    }

    const headers = lines[0].split(",").map((h) =>
      h
        .trim()
        .toLowerCase()
        .replace(/[^a-z]/g, ""),
    );
    const firstNameIdx = headers.findIndex((h) => h.includes("first") || h === "fname");
    const lastNameIdx = headers.findIndex((h) => h.includes("last") || h === "lname");
    const nameIdx = headers.findIndex((h) => h.includes("name") && !h.includes("first") && !h.includes("last"));
    const emailIdx = headers.findIndex((h) => h.includes("email"));
    const roleIdx = headers.findIndex((h) => h.includes("role"));
    const empIdIdx = headers.findIndex(
      (h) => h.includes("employee") || h.includes("empid") || h.includes("id"),
    );
    const phoneIdx = headers.findIndex(
      (h) => h.includes("phone") || h.includes("number"),
    );

    const rows: ParsedFacultyRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].trim();
      if (!currentLine) continue;

      const values = currentLine
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""));

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

      const rawEmail =
        emailIdx !== -1 && values[emailIdx]
          ? values[emailIdx]
          : values[1] || "";
      const rawRole =
        roleIdx !== -1 && values[roleIdx]
          ? values[roleIdx].toUpperCase()
          : values[2]
            ? values[2].toUpperCase()
            : "TEACHER";
      const rawEmpId =
        empIdIdx !== -1 && values[empIdIdx]
          ? values[empIdIdx]
          : values[3] || "";
      const rawPhone =
        phoneIdx !== -1 && values[phoneIdx]
          ? values[phoneIdx]
          : values[4] || "";
      const candidate = {
        name,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: rawEmail,
        role: ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"].includes(rawRole)
          ? rawRole
          : "TEACHER",
        employeeId: rawEmpId || undefined,
        phoneNumber: rawPhone || undefined,
      };

      const result = facultyRowSchema.safeParse(candidate);

      if (result.success) {
        rows.push({
          ...result.data,
          name: result.data.name || name,
          isValid: true,
          validationError: "",
        });
      } else {
        const firstError =
          result.error.issues[0]?.message || "Invalid row data";
        rows.push({
          ...candidate,
          isValid: false,
          validationError: firstError,
        });
      }
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

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
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        role: m.role,
        employeeId: m.employeeId,
        phoneNumber: m.phoneNumber,
      })),
      {
        onSuccess: (res: any) => {
          const result = res.data?.data;
          toast.success(
            `Successfully created ${result?.createdCount || validMembers.length} faculty member(s)! Credentials have been emailed to their address.`,
          );
          if (result?.skippedCount > 0) {
            toast.warning(
              `${result.skippedCount} entry/entries were skipped due to existing email or role restrictions.`,
            );
          }
          setFile(null);
          setParsedRows([]);
          onClose();
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to import faculty members.",
          );
        },
      },
    );
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-3xl p-6 border border-border shadow-2xl max-w-2xl max-h-[85vh] flex flex-col font-sans text-foreground">
        <DialogHeader className="text-left pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20">
              <FileSpreadsheet size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
                Bulk Import Faculty Members
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Upload a CSV file to add multiple faculty accounts. Unique
                temporary passwords will be automatically emailed to each
                member.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* File Upload Zone */}
          {!file ? (
            <div className="border-2 border-dashed border-border hover:border-primary/40 rounded-3xl p-8 text-center transition-all bg-muted/40 hover:bg-primary/10 flex flex-col items-center justify-center gap-3 group relative">
              <div className="p-4 bg-card rounded-2xl border border-border shadow-xs group-hover:scale-105 transition-transform text-primary">
                <Upload size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Click or drag CSV file to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports standard CSV files (.csv)
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute opacity-0 cursor-pointer w-full h-36"
              />
              <Button
                type="button"
                variant="outline"
                onClick={downloadSampleCSV}
                className="mt-2 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 rounded-xl gap-2 cursor-pointer"
              >
                <Download size={14} />
                Download Sample CSV Template
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-3.5 bg-muted/40 border border-border rounded-2xl">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={20} className="text-primary" />
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {parsedRows.length} entries parsed ({validCount} valid)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setParsedRows([]);
                    }}
                    className="text-muted-foreground hover:text-destructive text-xs cursor-pointer"
                  >
                    Change File
                  </Button>
                </div>
              </div>

              {/* Preview List */}
              {isParsing ? (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="animate-spin inline-block border-3 border-primary border-t-transparent rounded-full w-6 h-6 mb-2" />
                  <p className="text-xs font-medium">Parsing CSV contents...</p>
                </div>
              ) : parsedRows.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  No valid records found in file.
                </div>
              ) : (
                <div className="border border-border rounded-2xl overflow-hidden max-h-64 overflow-y-auto bg-card">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/80 text-muted-foreground font-semibold border-b border-border sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={
                            row.isValid
                              ? "hover:bg-accent/40"
                              : "bg-destructive/10"
                          }
                        >
                          <td className="py-2 px-3">
                            {row.isValid ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] gap-1"
                              >
                                <CheckCircle2 size={12} /> Valid
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] gap-1"
                              >
                                <AlertCircle size={12} /> {row.validationError}
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3 font-semibold text-foreground">
                            {row.name || "—"}
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">
                            {row.email || "—"}
                          </td>
                          <td className="py-2 px-3">
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase font-bold bg-muted text-muted-foreground border-border"
                            >
                              {row.role}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-right">
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
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Mail size={13} className="text-primary" />
            <span>Credentials will be auto-emailed on import</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-border text-xs font-semibold text-foreground hover:bg-accent cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={bulkCreateMutation.isPending || validCount === 0}
              onClick={handleImport}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-semibold px-5 cursor-pointer flex items-center gap-2 shadow-xs"
            >
              {bulkCreateMutation.isPending
                ? "Importing & Emailing..."
                : `Import ${validCount} Member(s)`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
