import {
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ParsedUserRow } from "@/features/users/types/types";

interface BulkUserTablePreviewProps {
  isExternal: boolean;
  file: File;
  parsedRows: ParsedUserRow[];
  validCount: number;
  isParsing: boolean;
  isPending: boolean;
  onRemoveFile: () => void;
  onEditRow: (index: number) => void;
  onRemoveRow: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function BulkUserTablePreview({
  isExternal,
  file,
  parsedRows,
  validCount,
  isParsing,
  isPending,
  onRemoveFile,
  onEditRow,
  onRemoveRow,
  onSubmit,
  onCancel,
}: BulkUserTablePreviewProps) {
  return (
    <div className="space-y-4">
      {/* File summary bar */}
      <div className="flex items-center justify-between p-3 bg-muted/30 border border-border/80 rounded-xl text-xs">
        <div className="flex items-center gap-2.5">
          {isExternal ? (
            <Building2 size={18} className="text-purple-600 dark:text-purple-400" />
          ) : (
            <FileSpreadsheet size={18} className="text-primary" />
          )}
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
          <div
            className={`animate-spin inline-block border-2 border-t-transparent rounded-full w-5 h-5 mb-2 ${
              isExternal ? "border-purple-600" : "border-primary"
            }`}
          />
          <p className="text-xs font-medium">Parsing spreadsheet data...</p>
        </div>
      ) : parsedRows.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-xs">
          No valid records found in file.
        </div>
      ) : (
        <div className="border border-border/80 rounded-xl overflow-hidden shadow-2xs bg-card">
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/80 text-muted-foreground font-bold border-b border-border/80 sticky top-0 backdrop-blur-xs">
                <tr>
                  <th className="py-2 px-3">Status</th>
                  {isExternal ? (
                    <>
                      <th className="py-2 px-3">Organization</th>
                      <th className="py-2 px-3">First Name</th>
                      <th className="py-2 px-3">Last Name</th>
                      <th className="py-2 px-3">Partner ID</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Phone</th>
                      <th className="py-2 px-3">Location</th>
                    </>
                  ) : (
                    <>
                      <th className="py-2 px-3">First Name</th>
                      <th className="py-2 px-3">Middle Name</th>
                      <th className="py-2 px-3">Last Name</th>
                      <th className="py-2 px-3">Employee ID</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Phone</th>
                      <th className="py-2 px-3">Role</th>
                    </>
                  )}
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {parsedRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      row.isValid ? "hover:bg-muted/30" : "bg-destructive/5"
                    }`}
                  >
                    <td className="py-2 px-3 whitespace-nowrap">
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

                    {isExternal ? (
                      <>
                        <td className="py-2 px-3 font-semibold text-foreground">
                          {row.companyName || (
                            <span className="text-muted-foreground italic">Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-foreground">
                          {row.firstName || (
                            <span className="text-muted-foreground italic">Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-foreground">
                          {row.lastName || (
                            <span className="text-muted-foreground italic">Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">
                          {row.employeeId || "—"}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{row.email}</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {row.phoneNumber || "—"}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {row.location || "Philippines"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-3 font-semibold text-foreground">
                          {row.firstName || (
                            <span className="text-muted-foreground italic">Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {row.middleName || "—"}
                        </td>
                        <td className="py-2 px-3 font-semibold text-foreground">
                          {row.lastName || (
                            <span className="text-muted-foreground italic">Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">
                          {row.employeeId || (
                            <span className="text-muted-foreground italic">Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{row.email}</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {row.phoneNumber || "—"}
                        </td>
                        <td className="py-2 px-3">
                          <Badge
                            variant="outline"
                            className="text-[9.5px] font-bold uppercase px-1.5 py-0"
                          >
                            {row.role}
                          </Badge>
                        </td>
                      </>
                    )}

                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditRow(idx)}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted h-6.5 w-6.5 p-0 rounded-md cursor-pointer transition-colors"
                          title="Edit Row Data"
                        >
                          <Edit3 size={13} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveRow(idx)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6.5 w-6.5 p-0 rounded-md cursor-pointer transition-colors"
                          title="Remove Entry"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
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
          Ready to process <strong className="text-foreground">{validCount}</strong> valid{" "}
          {isExternal ? "partner" : "user"} account(s)
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
            className={`cursor-pointer font-semibold px-6 py-2 rounded-lg h-9 text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 ${
              isExternal
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isPending ? (
              <span className="inline-block animate-spin border-2 border-current border-t-transparent rounded-full w-3.5 h-3.5" />
            ) : (
              <Sparkles size={14} />
            )}
            Import {validCount} {isExternal ? "Partner Account(s)" : "Account(s)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
