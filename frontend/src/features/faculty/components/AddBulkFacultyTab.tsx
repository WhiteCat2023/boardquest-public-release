import React from "react";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  HelpCircle,
  Download,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ParsedFacultyRow } from "@/features/faculty";

interface AddBulkFacultyTabProps {
  file: File | null;
  parsedRows: ParsedFacultyRow[];
  validCount: number;
  isParsing: boolean;
  dragActive: boolean;
  currentUserRole?: string;
  isPending: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onRemoveRow: (index: number) => void;
  onDownloadSampleCSV: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function AddBulkFacultyTab({
  file,
  parsedRows,
  validCount,
  isParsing,
  dragActive,
  currentUserRole,
  isPending,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onRemoveFile,
  onRemoveRow,
  onDownloadSampleCSV,
  onSubmit,
  onCancel,
}: AddBulkFacultyTabProps) {
  return (
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
              <h2 className="text-sm font-bold text-foreground">Bulk CSV Account Importer</h2>
              <p className="text-[11px] text-muted-foreground font-medium">
                Upload a .csv spreadsheet containing faculty accounts.
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
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive
                  ? "border-primary bg-primary/10 scale-[0.99]"
                  : "border-border/80 bg-muted/30 hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <div className="p-3 bg-card rounded-xl border border-border/80 shadow-2xs text-primary mb-2">
                <Upload size={22} />
              </div>
              <h3 className="text-sm font-bold text-foreground">Upload Faculty CSV File</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
                Drag and drop your spreadsheet here or click to browse files (.csv)
              </p>

              <input
                type="file"
                accept=".csv"
                onChange={onFileChange}
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
                  onClick={onRemoveFile}
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
                  No valid faculty rows found in file.
                </div>
              ) : (
                <div className="border border-border/80 rounded-xl overflow-hidden shadow-2xs bg-card">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/80 text-muted-foreground font-bold border-b border-border/80 sticky top-0 backdrop-blur-xs">
                        <tr>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Role</th>
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
                            <td className="py-2 px-3 text-muted-foreground">{row.email}</td>
                            <td className="py-2 px-3">
                              <Badge variant="outline" className="text-[9.5px] font-bold uppercase px-1.5 py-0">
                                {row.role}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveRow(idx)}
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
                    onClick={onCancel}
                    disabled={isPending}
                    className="cursor-pointer border-border hover:bg-accent text-foreground font-semibold px-4 py-2 rounded-lg h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={validCount === 0 || isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-semibold px-6 py-2 rounded-lg h-9 text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isPending ? (
                      <span className="inline-block animate-spin border-2 border-primary-foreground border-t-transparent rounded-full w-3.5 h-3.5" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    Import {validCount} Account(s)
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
                <strong className="text-foreground font-bold">Role</strong> (TEACHER, TEAMLEAD, ADMIN)
              </li>
              <li>
                <strong className="text-foreground font-bold">EmployeeID</strong> (Optional)
              </li>
              <li>
                <strong className="text-foreground font-bold">PhoneNumber</strong> (Optional)
              </li>
            </ul>

            <Button
              type="button"
              onClick={onDownloadSampleCSV}
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
            Login passwords will be automatically generated and dispatched to each registered faculty email address.
          </p>
        </Card>
      </div>
    </div>
  );
}
