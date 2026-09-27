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

export function useBulkUserUpload(accountCategory: "internal" | "external") {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedUserRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const bulkCreateMutation = useBulkCreateUser();

  const resetUpload = () => {
    setFile(null);
    setParsedRows([]);
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
          const createdCount =
            res?.data?.data?.users?.createdCount ||
            res?.createdCount ||
            validMembers.length;
          toast.success(
            accountCategory === "external"
              ? `Successfully registered ${createdCount} external review center account(s)!`
              : `Successfully registered ${createdCount} internal user account(s)!`,
          );
          navigate("/faculty-management");
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
