import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { showFeedback } from "@/components/modal";
import useAuth from "@/hooks/useAuth";
import { useBulkCreateStudents } from "@/features/students";
import { parseStudentCSV, type ParsedStudentRow } from "../../utils/csvParser";
import { BulkCsvDropzone } from "./BulkCsvDropzone";
import { BulkCsvPreviewTable } from "./BulkCsvPreviewTable";
import { BulkCsvRequirementsSidebar } from "./BulkCsvRequirementsSidebar";
import {
  BulkUploadSummaryModal,
  type BulkUploadDetailItem,
} from "@/components/feedback";

export function BulkEnrollTab() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const currentUserRole = (auth as any)?.data?.user?.role;

  const bulkCreateMutation = useBulkCreateStudents();
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<{
    isOpen: boolean;
    totalCount: number;
    successfulCount: number;
    skippedCount: number;
    details?: BulkUploadDetailItem[];
  } | null>(null);

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      showFeedback.error("Please upload a valid .csv file");
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = parseStudentCSV(text);
      setParsedRows(parsed);
      setIsParsing(false);
    };
    reader.onerror = () => {
      showFeedback.error("Failed to read CSV file.");
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

  const handleClearFile = () => {
    setFile(null);
    setParsedRows([]);
  };

  const handleBulkSubmit = () => {
    const validStudents = parsedRows.filter((r) => r.isValid);
    if (validStudents.length === 0) {
      showFeedback.error("No valid student entries to import.");
      return;
    }

    bulkCreateMutation.mutate(
      validStudents.map((s) => ({
        firstName: s.firstName,
        lastName: s.lastName,
        name: s.name,
        email: s.email,
        location: s.location,
      })),
      {
        onSuccess: (res: any) => {
          const result = res.data?.data;
          const createdCount = Number(result?.createdCount ?? 0);
          const totalProcessed = Number(
            result?.totalProcessed ?? validStudents.length,
          );
          const rawSkipped = Number(result?.skippedCount ?? 0);
          const skippedCount =
            rawSkipped > 0
              ? rawSkipped
              : Math.max(0, validStudents.length - createdCount);
          const errors = result?.errors || [];

          if (skippedCount > 0 || (createdCount === 0 && validStudents.length > 0)) {
            setUploadSummary({
              isOpen: true,
              totalCount: totalProcessed,
              successfulCount: createdCount,
              skippedCount: Math.max(skippedCount, validStudents.length - createdCount),
              details:
                errors.length > 0
                  ? errors.map((e: any) => ({
                      label: e.email || e.name || "Student account",
                      reason: e.error || "Student email already exists",
                    }))
                  : validStudents.map((s) => ({
                      label: s.email || s.name || "Student account",
                      reason: "Account with this email already exists",
                    })),
            });
          } else {
            showFeedback.success(
              `Successfully enrolled ${createdCount} student(s)! Credentials sent to emails.`,
            );
            navigate("/student-management");
          }
        },
        onError: (err: any) => {
          showFeedback.error(
            err.response?.data?.message || "Failed to import student accounts.",
          );
        },
      }
    );
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
      
      {/* Right Info Sidebar Card */}
      <BulkCsvRequirementsSidebar />

      {/* Main Bulk Upload Card */}
      <div className="lg:col-span-2 bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="p-4 border-b border-border/60 flex items-center justify-between gap-3 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <FileSpreadsheet size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Bulk CSV Student Importer
              </h2>
              <p className="text-[11px] text-muted-foreground font-medium">
                Upload a .csv spreadsheet containing student accounts.
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="text-[10px] font-bold uppercase px-2 py-0.5"
          >
            {currentUserRole || "DEAN"}
          </Badge>
        </div>

        {/* Upload Zone & Table */}
        <div className="p-5 flex flex-col gap-4">
          {!file ? (
            <BulkCsvDropzone
              dragActive={dragActive}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onFileChange={handleFileChange}
            />
          ) : (
            <BulkCsvPreviewTable
              file={file}
              parsedRows={parsedRows}
              validCount={validCount}
              isParsing={isParsing}
              isPending={bulkCreateMutation.isPending}
              onClearFile={handleClearFile}
              onRemoveRow={handleRemoveRow}
              onSubmit={handleBulkSubmit}
              onCancel={() => navigate("/student-management")}
            />
          )}
        </div>
      </div>

      {/* Bulk Upload Summary Modal */}
      <BulkUploadSummaryModal
        open={Boolean(uploadSummary?.isOpen)}
        onOpenChange={(open) => {
          if (!open) {
            setUploadSummary(null);
            navigate("/student-management");
          }
        }}
        title={
          uploadSummary && uploadSummary.successfulCount === 0
            ? "All Students Skipped"
            : "Student Enrollment Complete with Notices"
        }
        description={
          uploadSummary && uploadSummary.successfulCount === 0
            ? "All students in this CSV already exist in the database or failed validation."
            : undefined
        }
        stats={{
          total: uploadSummary?.totalCount || 0,
          successful: uploadSummary?.successfulCount || 0,
          skipped: uploadSummary?.skippedCount || 0,
        }}
        skippedReasonText="Students with emails already registered in the system were skipped to prevent duplicate accounts."
        details={uploadSummary?.details}
        primaryAction={{
          label: "View Student Directory",
          onClick: () => {
            setUploadSummary(null);
            navigate("/student-management");
          },
        }}
      />
    </div>
  );
}
