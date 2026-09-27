import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useRoleFlags from "@/hooks/useRoleFlags";
import { useBulkUserUpload } from "../api/useBulkUserUpload";
import {
  BulkUserDropzone,
  BulkUserTablePreview,
  BulkUserRequirementsSidebar,
} from "./bulk";
import EditParsedUserDialog from "./EditParsedUserDialog";

interface AddBulkUserTabProps {
  accountCategory?: "internal" | "external";
  onCancel?: () => void;
}

export default function AddBulkUserTab({
  accountCategory = "internal",
  onCancel,
}: AddBulkUserTabProps) {
  const navigate = useNavigate();
  const { userRole } = useRoleFlags();
  const currentUserRole = userRole as string;
  const isExternal = accountCategory === "external";
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const {
    file,
    parsedRows,
    validCount,
    isParsing,
    dragActive,
    isPending,
    resetUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleRemoveRow,
    handleUpdateRow,
    handleDownloadSampleCSV,
    handleDownloadSampleXLSX,
    handleBulkSubmit,
  } = useBulkUserUpload(accountCategory);

  const handleCancel = onCancel || (() => navigate("/faculty-management"));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full font-sans">
      {/* Main Bulk Upload Card */}
      <div className="lg:col-span-2 bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="p-4 border-b border-border/60 flex items-center justify-between gap-3 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg border ${
                isExternal
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                  : "bg-primary/10 text-primary border-primary/20"
              }`}
            >
              {isExternal ? (
                <Building2 size={18} className="stroke-[2.5]" />
              ) : (
                <FileSpreadsheet size={18} className="stroke-[2.5]" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {isExternal
                  ? "Bulk Spreadsheet External Account Importer"
                  : "Bulk Spreadsheet Account Importer"}
              </h2>
              <p className="text-[11px] text-muted-foreground font-medium">
                {isExternal
                  ? "Upload a .csv or .xlsx spreadsheet containing Review Center representative accounts."
                  : "Upload a .csv or .xlsx spreadsheet containing internal user accounts."}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`text-[10px] font-bold uppercase px-2 py-0.5 ${
              isExternal
                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                : ""
            }`}
          >
            {isExternal ? "REVIEW CENTER" : currentUserRole || "DEAN"}
          </Badge>
        </div>

        {/* Upload Zone & Table */}
        <div className="p-5 flex flex-col gap-4">
          {!file ? (
            <BulkUserDropzone
              isExternal={isExternal}
              dragActive={dragActive}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileChange={handleFileChange}
            />
          ) : (
            <BulkUserTablePreview
              isExternal={isExternal}
              file={file}
              parsedRows={parsedRows}
              validCount={validCount}
              isParsing={isParsing}
              isPending={isPending}
              onRemoveFile={resetUpload}
              onEditRow={(idx) => setEditingIndex(idx)}
              onRemoveRow={handleRemoveRow}
              onSubmit={handleBulkSubmit}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>

      {/* Right Info Sidebar Card */}
      <BulkUserRequirementsSidebar
        isExternal={isExternal}
        onDownloadSampleCSV={handleDownloadSampleCSV}
        onDownloadSampleXLSX={handleDownloadSampleXLSX}
      />

      {/* Edit Extracted User Dialog */}
      <EditParsedUserDialog
        isOpen={editingIndex !== null}
        onClose={() => setEditingIndex(null)}
        row={editingIndex !== null ? parsedRows[editingIndex] : null}
        rowIndex={editingIndex}
        accountCategory={accountCategory}
        onSave={(index, updatedRow) => {
          handleUpdateRow(index, updatedRow);
        }}
      />
    </div>
  );
}

export const AddBulkFacultyTab = AddBulkUserTab;
