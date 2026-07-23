import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, Trash2, Mail, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useBulkCreateStudents } from "./hooks/useStudent";
import useAuth from "@/hooks/useAuth";

interface ParsedStudentRow {
  name: string;
  email: string;
  location?: string;
  isValid: boolean;
  validationError?: string;
}

export default function AddedStudentUsingCSV() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const currentUserRole = (auth as any)?.data?.user?.role;

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

  const handleImport = () => {
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
            `Successfully enrolled ${result?.createdCount || validStudents.length} student(s)! Credentials have been emailed.`
          );
          if (result?.skippedCount > 0) {
            toast.warning(`${result.skippedCount} entry/entries skipped due to existing email registration.`);
          }
          navigate("/student-management");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to enroll students.");
        },
      }
    );
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-300 font-sans">
      {/* Back button */}
      <button
        onClick={() => navigate("/student-management")}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#A70202] transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={16} />
        Back to Student Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
        {/* Main Bulk Upload Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden flex flex-col">
          {/* Header Bar */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-red-50 text-[#A70202] border border-[#A70202]/10 shadow-xs">
                <FileSpreadsheet size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Bulk Student Importer</h2>
                <p className="text-xs text-slate-400 font-medium">
                  Enroll students in batch via CSV and dispatch credentials to their emails automatically.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end text-xs text-slate-500 font-medium border-l-2 md:border-l-0 md:border-r-2 border-[#A70202]/30 pl-3 md:pl-0 md:pr-3 py-0.5">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Manager Role</span>
              <span className="text-slate-800 font-bold text-sm">{currentUserRole || "ADMIN"}</span>
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
                  dragActive ? "border-[#A70202] bg-[#A70202]/5 scale-[0.99]" : "border-slate-200 bg-slate-50/50 hover:border-[#A70202]/40 hover:bg-[#A70202]/5"
                }`}
              >
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-[#A70202] mb-3">
                  <Upload size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800">Upload Student CSV File</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Drag and drop your student spreadsheet here or click to browse files (.csv format)
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
                  className="mt-6 text-xs font-semibold bg-white text-[#A70202] border border-[#A70202]/30 hover:bg-[#A70202]/10 rounded-xl gap-2 cursor-pointer shadow-2xs"
                >
                  <Download size={14} />
                  Download Sample CSV Template
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* File summary bar */}
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet size={22} className="text-[#A70202]" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{file.name}</p>
                      <p className="text-xs text-slate-400">
                        {parsedRows.length} total entries parsed &bull; <strong className="text-emerald-700">{validCount} valid</strong>
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
                    className="text-xs font-semibold border-slate-200 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Upload Different File
                  </Button>
                </div>

                {/* Table Preview */}
                {isParsing ? (
                  <div className="py-16 text-center text-slate-400">
                    <div className="animate-spin inline-block border-3 border-[#A70202] border-t-transparent rounded-full w-7 h-7 mb-3" />
                    <p className="text-sm font-medium">Parsing student CSV spreadsheet...</p>
                  </div>
                ) : parsedRows.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">No valid student rows found in file.</div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="max-h-80 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 sticky top-0 backdrop-blur-xs">
                          <tr>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Full Name</th>
                            <th className="py-3 px-4">Email Address</th>
                            <th className="py-3 px-4">Location</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedRows.map((row, idx) => (
                            <tr key={idx} className={row.isValid ? "hover:bg-slate-50/70" : "bg-red-50/60"}>
                              <td className="py-2.5 px-4">
                                {row.isValid ? (
                                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1">
                                    <CheckCircle2 size={12} /> Ready
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] gap-1">
                                    <AlertCircle size={12} /> {row.validationError}
                                  </Badge>
                                )}
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-slate-800">{row.name || "—"}</td>
                              <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">{row.email || "—"}</td>
                              <td className="py-2.5 px-4 text-slate-500">{row.location || "Philippines"}</td>
                              <td className="py-2.5 px-4 text-right">
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
                  </div>
                )}

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={16} className="text-[#A70202]" />
                    <span>Credentials (unique temp passwords) will be auto-emailed upon enrollment</span>
                  </div>

                  <Button
                    type="button"
                    disabled={bulkCreateMutation.isPending || validCount === 0}
                    onClick={handleImport}
                    className="bg-[#A70202] hover:bg-[#8f0101] text-white rounded-xl text-xs font-semibold px-6 h-11 cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    {bulkCreateMutation.isPending ? "Enrolling Accounts..." : `Enroll ${validCount} Student Account(s)`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Info Sidebar Card */}
        <div className="flex flex-col gap-6">
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <CardHeader className="p-0 space-y-1 mb-4">
              <div className="flex items-center gap-2 text-[#A70202]">
                <HelpCircle size={18} />
                <CardTitle className="text-base font-bold text-slate-800">CSV Template Guidelines</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-4 text-xs text-slate-500 leading-relaxed">
              <p>
                Follow the format below when preparing your student enrollment CSV spreadsheet:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono text-[11px] text-slate-700">
                <p className="font-bold text-[#A70202]">Required Columns:</p>
                <p>&bull; Name (e.g. Alexander Wright)</p>
                <p>&bull; Email (e.g. alex@student.edu)</p>
                <div className="pt-2 font-bold text-slate-600">Optional Columns:</div>
                <p>&bull; Location (e.g. Manila)</p>
              </div>

              <div className="p-3 bg-[#A70202]/5 border border-[#A70202]/15 rounded-xl text-[11px] text-slate-700 space-y-1">
                <p className="font-bold text-[#A70202] flex items-center gap-1">
                  <Mail size={13} /> Credential Email Dispatch:
                </p>
                <p>
                  A unique 8-character temporary password (e.g. <code className="bg-white px-1 py-0.5 rounded text-[#A70202] border border-[#A70202]/20 font-bold">BQ-STU-8A3X</code>) is generated for each student and sent directly to their email.
                </p>
              </div>

              <Button
                type="button"
                onClick={downloadSampleCSV}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 text-xs font-semibold rounded-xl h-10 gap-2 cursor-pointer mt-2"
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
