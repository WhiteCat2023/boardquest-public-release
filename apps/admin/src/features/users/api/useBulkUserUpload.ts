import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useBulkCreateUser } from "@/features/users/api/useUsers";
import type { ParsedUserRow } from "@/features/users/types/types";
import {
  parseUserSpreadsheetFile,
  downloadSampleUserCSV,
  downloadSampleUserXLSX,
} from "@/features/users/utils/userSpreadsheetParser";

export interface UserUploadSummary {
  isOpen: boolean;
  totalCount: number;
  successfulCount: number;
  skippedCount: number;
  details?: Array<{ label: string; reason?: string }>;
}

export function useBulkUserUpload(accountCategory: "internal" | "external") {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedUserRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<UserUploadSummary | null>(null);
  const bulkCreateMutation = useBulkCreateUser();

  const resetUpload = () => {
    setFile(null);
    setParsedRows([]);
    setUploadSummary(null);
  };

  const closeUploadSummary = () => {
    setUploadSummary(null);
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);

    const parsed = await parseUserSpreadsheetFile(selectedFile, accountCategory);
    setParsedRows(parsed);
    setIsParsing(false);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleRemoveRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, updatedRow: ParsedUserRow) => {
    setParsedRows((prev) => {
      const next = [...prev];
      next[index] = updatedRow;
      return next;
    });
    toast.success(`Entry #${index + 1} updated successfully.`);
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  const handleBulkSubmit = () => {
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
        companyName: m.companyName,
        location: m.location,
      })),
      {
        onSuccess: (res: any) => {
          const payload = res?.data?.data || res?.data || res;
          // The API controller returns { users: { totalProcessed, createdCount, skippedCount, errors } }
          const usersData =
            payload?.users ||
            payload?.faculty ||
            payload?.faculties ||
            payload;

          const createdCount = Number(
            usersData?.createdCount ??
              payload?.createdCount ??
              0,
          );
          const totalProcessed = Number(
            usersData?.totalProcessed ??
              payload?.totalProcessed ??
              validMembers.length,
          );
          const rawSkipped = Number(
            usersData?.skippedCount ??
              payload?.skippedCount ??
              0,
          );
          const skippedCount =
            rawSkipped > 0
              ? rawSkipped
              : Math.max(0, validMembers.length - createdCount);
          const errors = usersData?.errors || payload?.errors || [];

          // If ANY accounts were skipped or none were created from the batch, show the summary modal
          if (skippedCount > 0 || (createdCount === 0 && validMembers.length > 0)) {
            const finalSkippedCount = Math.max(
              skippedCount,
              validMembers.length - createdCount,
            );

            setUploadSummary({
              isOpen: true,
              totalCount: totalProcessed,
              successfulCount: createdCount,
              skippedCount: finalSkippedCount,
              details:
                errors.length > 0
                  ? errors.map((e: any) => ({
                      label: e.email || e.name || "User account",
                      reason:
                        e.error ||
                        "Account already exists (email or employee ID collision).",
                    }))
                  : validMembers.map((m) => ({
                      label: m.email || m.name || "User account",
                      reason:
                        "Account with this email or employee ID already exists.",
                    })),
            });
            // Do NOT navigate; user views the summary modal on the current screen
          } else {
            // 100% clean success: Toast only, auto-redirect immediately
            toast.success(
              accountCategory === "external"
                ? `Successfully registered ${createdCount} external review center account(s)!`
                : `Successfully registered ${createdCount} internal user account(s)!`,
            );
            navigate("/faculty-management");
          }
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message || "Failed to process bulk import.";
          toast.error(msg);
        },
      },
    );
  };

  return {
    file,
    parsedRows,
    validCount,
    isParsing,
    dragActive,
    isPending: bulkCreateMutation.isPending,
    uploadSummary,
    closeUploadSummary,
    resetUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleRemoveRow,
    handleUpdateRow,
    handleDownloadSampleCSV: () => downloadSampleUserCSV(accountCategory),
    handleDownloadSampleXLSX: () => downloadSampleUserXLSX(accountCategory),
    handleBulkSubmit,
  };
}
