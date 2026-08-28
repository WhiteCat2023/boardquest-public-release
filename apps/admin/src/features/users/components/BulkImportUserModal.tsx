import { useState } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Mail,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useBulkCreateUser } from "@/features/users";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import EditParsedUserDialog from "./EditParsedUserDialog";
import type { ParsedUserRow } from "../types/types";

const userRowSchema = z
  .object({
    name: z.string().optional(),
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().min(1, "Missing Email").email("Invalid Email"),
    role: z
      .union([z.string(), z.number()])
      .transform((val) => String(val))
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

interface BulkImportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkImportUserModal({
  isOpen,
  onClose,
}: BulkImportUserModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedUserRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const bulkCreateMutation = useBulkCreateUser();

  const downloadSampleCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "FirstName,MiddleName,LastName,EmployeeID,Email,PhoneNumber,Role\n" +
      "Jane,Smith,Doe,EMP-001,jane.doe@boardquest.edu,09171234567,TEACHER\n" +
      "Juan,,Dela Cruz,EMP-002,juan.delacruz@boardquest.edu,09187654321,TEAMLEAD\n" +
      "Elena,,Reyes,EMP-003,elena.reyes@boardquest.edu,09191234567,DEAN\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "BoardQuest_Users_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info("Sample User CSV template downloaded.");
  };

  const downloadSampleXLSX = () => {
    const data = [
      ["FirstName", "MiddleName", "LastName", "EmployeeID", "Email", "PhoneNumber", "Role"],
      ["Jane", "Smith", "Doe", "EMP-001", "jane.doe@boardquest.edu", "09171234567", "TEACHER"],
      ["Juan", "", "Dela Cruz", "EMP-002", "juan.delacruz@boardquest.edu", "09187654321", "TEAMLEAD"],
      ["Elena", "", "Reyes", "EMP-003", "elena.reyes@boardquest.edu", "09191234567", "DEAN"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Internal Users");
    XLSX.writeFile(wb, "BoardQuest_Users_Template.xlsx");
    toast.info("Sample User Excel (.xlsx) template downloaded.");
  };

  const normalizeRoleForImport = (raw: string): string => {
    const r = (raw || "").trim().toUpperCase();
    if (r === "SUPERADMIN") return "SUPERADMIN";
    if (r === "DEAN" || r === "ADMIN") return "DEAN";
    if (r === "TEAMLEAD" || r === "CO-ADMIN") return "TEAMLEAD";
    if (r === "TEACHER" || r === "INSTRUCTOR") return "TEACHER";
    if (r === "REVIEWCENTER" || r === "EXTERNAL") return "REVIEWCENTER";
    return "TEACHER";
  };

  const parseSpreadsheetData = (sheetData: (string | number)[][]) => {
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
    const firstNameIdx = headers.findIndex((h) => h.includes("first") || h === "fname" || h === "firstname");
    const middleNameIdx = headers.findIndex((h) => h.includes("middle") || h === "mname" || h === "mi" || h === "middlename");
    const lastNameIdx = headers.findIndex((h) => h.includes("last") || h === "lname" || h === "lastname" || h.includes("surname"));
    const nameIdx = headers.findIndex((h) => (h === "name" || h === "fullname") && !h.includes("first") && !h.includes("middle") && !h.includes("last"));
    const emailIdx = headers.findIndex((h) => h.includes("email") || h === "mail");
    const roleIdx = headers.findIndex((h) => h.includes("role") || h.includes("position") || h.includes("designation"));
    const empIdIdx = headers.findIndex(
      (h) =>
        h.includes("employee") ||
        h === "empid" ||
        h === "employeeid" ||
        h === "id" ||
        h === "idnumber" ||
        h === "idno" ||
        (h.endsWith("id") && !h.includes("middle"))
    );
    const phoneIdx = headers.findIndex(
      (h) =>
        h.includes("phone") ||
        h.includes("contact") ||
        h.includes("mobile") ||
        h.includes("cell") ||
        (h.includes("number") && !h.includes("id"))
    );

    const rows: ParsedUserRow[] = [];

    for (let i = 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (!row || !Array.isArray(row)) continue;

      const hasAnyValue = row.some((cell) => String(cell ?? "").trim().length > 0);
      if (!hasAnyValue) continue;

      let firstName = firstNameIdx !== -1 && row[firstNameIdx] !== undefined ? String(row[firstNameIdx]).trim() : "";
      let middleName = middleNameIdx !== -1 && row[middleNameIdx] !== undefined ? String(row[middleNameIdx]).trim() : "";
      let lastName = lastNameIdx !== -1 && row[lastNameIdx] !== undefined ? String(row[lastNameIdx]).trim() : "";
      let name: string;

      if (firstName || lastName) {
        name = [firstName, middleName, lastName].filter(Boolean).join(" ").trim();
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

      const rawEmail =
        emailIdx !== -1 && row[emailIdx] !== undefined
          ? String(row[emailIdx]).trim()
          : String(row[1] ?? "").trim();
      const rawRole =
        roleIdx !== -1 && row[roleIdx] !== undefined
          ? String(row[roleIdx]).trim().toUpperCase()
          : row[2]
            ? String(row[2]).trim().toUpperCase()
            : "TEACHER";
      const rawEmpId =
        empIdIdx !== -1 && row[empIdIdx] !== undefined
          ? String(row[empIdIdx]).trim()
          : String(row[3] ?? "").trim();
      const rawPhone =
        phoneIdx !== -1 && row[phoneIdx] !== undefined
          ? String(row[phoneIdx]).trim()
          : String(row[4] ?? "").trim();
      const candidate = {
        name: name || [firstName, middleName, lastName].filter(Boolean).join(" ").trim(),
        firstName: firstName || undefined,
        middleName: middleName || undefined,
        lastName: lastName || undefined,
        email: rawEmail,
        role: normalizeRoleForImport(rawRole),
        employeeId: rawEmpId || undefined,
        phoneNumber: rawPhone || undefined,
      };

      const result = userRowSchema.safeParse(candidate);

      if (result.success && candidate.employeeId && candidate.phoneNumber) {
        rows.push({
          ...result.data,
          name: result.data.name || name,
          isValid: true,
          validationError: "",
        });
      } else {
        let firstError =
          result.error?.issues[0]?.message || "Invalid row data";
        if (!candidate.employeeId) firstError = "Missing Employee ID";
        else if (!candidate.phoneNumber) firstError = "Missing Phone Number";

        rows.push({
          ...candidate,
          isValid: false,
          validationError: firstError,
        });
      }
    }

    return rows;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

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
      const sheetData = XLSX.utils.sheet_to_json<(string | number)[]>(worksheet, {
        header: 1,
        defval: "",
        blankrows: false,
      });

      const parsed = parseSpreadsheetData(sheetData);
      setParsedRows(parsed);
    } catch (err) {
      console.error("Failed to parse file:", err);
      toast.error("Failed to read spreadsheet file.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleRemoveRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateRow = (index: number, updatedRow: ParsedUserRow) => {
    setParsedRows((prev) => {
      const next = [...prev];
      next[index] = updatedRow;
      return next;
    });
    toast.success(`Entry #${index + 1} updated.`);
  };

  const handleImport = () => {
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
      })),
      {
        onSuccess: (res: any) => {
          const result = res.data?.data;
          toast.success(
            `Successfully created ${result?.createdCount || validMembers.length} user account(s)! Credentials have been emailed to their address.`,
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
            err.response?.data?.message || "Failed to import user accounts.",
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
                Bulk Import User Accounts
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Upload a CSV or Excel (.xlsx) file to add multiple user accounts. Unique
                temporary passwords will be automatically emailed to each
                user.
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
                  Click or drag CSV/Excel file to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports CSV and Excel files (.csv, .xlsx, .xls)
                </p>
              </div>
              <input
                type="file"
                accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                className="absolute opacity-0 cursor-pointer w-full h-36"
              />
              <div className="flex items-center gap-2 mt-2 z-10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadSampleCSV}
                  className="text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 rounded-xl gap-2 cursor-pointer"
                >
                  <Download size={14} />
                  Template (.csv)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadSampleXLSX}
                  className="text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 rounded-xl gap-2 cursor-pointer"
                >
                  <Download size={14} />
                  Template (.xlsx)
                </Button>
              </div>
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
                        <th className="py-2.5 px-3">First Name</th>
                        <th className="py-2.5 px-3">Middle Name</th>
                        <th className="py-2.5 px-3">Last Name</th>
                        <th className="py-2.5 px-3">Employee ID</th>
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
                            {row.firstName || (
                              <span className="text-muted-foreground italic">
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">
                            {row.middleName || "—"}
                          </td>
                          <td className="py-2 px-3 font-semibold text-foreground">
                            {row.lastName || (
                              <span className="text-muted-foreground italic">
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">
                            {row.employeeId || "—"}
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">
                            {row.email || "—"}
                          </td>
                          <td className="py-2 px-3">
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase font-bold bg-muted text-muted-foreground border-border"
                            >
                              {String(row.role)}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingIndex(idx)}
                                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg cursor-pointer p-0"
                                title="Edit Entry"
                              >
                                <Edit3 size={13} />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveRow(idx)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer p-0"
                                title="Remove Entry"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
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
                : `Import ${validCount} Account(s)`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Edit Extracted User Dialog */}
      <EditParsedUserDialog
        isOpen={editingIndex !== null}
        onClose={() => setEditingIndex(null)}
        row={editingIndex !== null ? parsedRows[editingIndex] : null}
        rowIndex={editingIndex}
        accountCategory="internal"
        onSave={handleUpdateRow}
      />
    </Dialog>
  );
}

export const BulkImportFacultyModal = BulkImportUserModal;
