import { useState } from "react";
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useBulkCreateFaculty } from "../hooks/useFaculty";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

interface BulkImportFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkImportFacultyModal({ isOpen, onClose }: BulkImportFacultyModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedFacultyRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const bulkCreateMutation = useBulkCreateFaculty();

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

      // Match values taking into account quotes or simple commas
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
            `Successfully created ${result?.createdCount || validMembers.length} faculty member(s)! Credentials have been emailed to their address.`
          );
          if (result?.skippedCount > 0) {
            toast.warning(`${result.skippedCount} entry/entries were skipped due to existing email or role restrictions.`);
          }
          setFile(null);
          setParsedRows([]);
          onClose();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to import faculty members.");
        },
      }
    );
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="text-left pb-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#A70202]/10 text-[#A70202] rounded-2xl border border-[#A70202]/15">
              <FileSpreadsheet size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight">
                Bulk Import Faculty Members
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Upload a CSV file to add multiple faculty accounts. Unique temporary passwords will be automatically emailed to each member.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* File Upload Zone */}
          {!file ? (
            <div className="border-2 border-dashed border-slate-200 hover:border-[#A70202]/40 rounded-3xl p-8 text-center transition-all bg-slate-50/50 hover:bg-[#A70202]/5 flex flex-col items-center justify-center gap-3 group">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs group-hover:scale-105 transition-transform text-[#A70202]">
                <Upload size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Click or drag CSV file to upload</p>
                <p className="text-xs text-slate-400 mt-1">Supports standard CSV files (.csv)</p>
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
                className="mt-2 text-xs font-semibold text-[#A70202] border-[#A70202]/30 hover:bg-[#A70202]/10 rounded-xl gap-2 cursor-pointer"
              >
                <Download size={14} />
                Download Sample CSV Template
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={20} className="text-[#A70202]" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{file.name}</p>
                    <p className="text-[11px] text-slate-400">
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
                    className="text-slate-400 hover:text-red-600 text-xs cursor-pointer"
                  >
                    Change File
                  </Button>
                </div>
              </div>

              {/* Preview List */}
              {isParsing ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="animate-spin inline-block border-3 border-[#A70202] border-t-transparent rounded-full w-6 h-6 mb-2" />
                  <p className="text-xs font-medium">Parsing CSV contents...</p>
                </div>
              ) : parsedRows.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">No valid records found in file.</div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className={row.isValid ? "hover:bg-slate-50/60" : "bg-red-50/50"}>
                          <td className="py-2 px-3">
                            {row.isValid ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1">
                                <CheckCircle2 size={12} /> Valid
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] gap-1">
                                <AlertCircle size={12} /> {row.validationError}
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{row.name || "—"}</td>
                          <td className="py-2 px-3 text-slate-600">{row.email || "—"}</td>
                          <td className="py-2 px-3">
                            <Badge variant="muted" className="text-[10px] uppercase font-bold">
                              {row.role}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveRow(idx)}
                              className="h-7 w-7 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
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

        <DialogFooter className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Mail size={13} className="text-[#A70202]" />
            <span>Credentials will be auto-emailed on import</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={bulkCreateMutation.isPending || validCount === 0}
              onClick={handleImport}
              className="bg-[#A70202] hover:bg-[#8f0101] text-white rounded-xl text-xs font-semibold px-5 cursor-pointer flex items-center gap-2"
            >
              {bulkCreateMutation.isPending ? "Importing & Emailing..." : `Import ${validCount} Member(s)`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
