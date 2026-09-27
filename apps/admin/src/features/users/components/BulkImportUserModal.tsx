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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useBulkUserUpload } from "../api/useBulkUserUpload";
import EditParsedUserDialog from "./EditParsedUserDialog";

interface BulkImportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkImportUserModal({
  isOpen,
  onClose,
}: BulkImportUserModalProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const {
    file,
    parsedRows,
    validCount,
    isParsing,
    isPending,
    resetUpload,
    handleFileChange,
    handleRemoveRow,
    handleUpdateRow,
    handleDownloadSampleCSV,
    handleDownloadSampleXLSX,
    handleBulkSubmit,
  } = useBulkUserUpload("internal");

  const handleClose = () => {
    resetUpload();
    onClose();
  };

  const handleImport = () => {
    handleBulkSubmit();
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
                  onClick={handleDownloadSampleCSV}
                  className="text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 rounded-xl gap-2 cursor-pointer"
                >
                  <Download size={14} />
                  Template (.csv)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadSampleXLSX}
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
                    onClick={resetUpload}
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
              onClick={handleClose}
              className="rounded-xl border-border text-xs font-semibold text-foreground hover:bg-accent cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending || validCount === 0}
              onClick={handleImport}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-semibold px-5 cursor-pointer flex items-center gap-2 shadow-xs"
            >
              {isPending
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
