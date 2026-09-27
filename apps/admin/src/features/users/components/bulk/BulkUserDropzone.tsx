import React from "react";
import { Upload } from "lucide-react";

interface BulkUserDropzoneProps {
  isExternal: boolean;
  dragActive: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BulkUserDropzone({
  isExternal,
  dragActive,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
}: BulkUserDropzoneProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
        dragActive
          ? isExternal
            ? "border-purple-500 bg-purple-500/10 scale-[0.99]"
            : "border-primary bg-primary/10 scale-[0.99]"
          : isExternal
          ? "border-border/80 bg-muted/30 hover:border-purple-500/40 hover:bg-purple-500/5"
          : "border-border/80 bg-muted/30 hover:border-primary/40 hover:bg-primary/5"
      }`}
    >
      <div
        className={`p-3 bg-card rounded-xl border border-border/80 shadow-2xs mb-2 ${
          isExternal ? "text-purple-600 dark:text-purple-400" : "text-primary"
        }`}
      >
        <Upload size={22} />
      </div>
      <h3 className="text-sm font-bold text-foreground">
        {isExternal
          ? "Upload External Partners Spreadsheet"
          : "Upload Users Spreadsheet"}
      </h3>
      <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
        Drag and drop your spreadsheet here or click to browse files (.csv, .xlsx, .xls)
      </p>

      <input
        type="file"
        accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        onChange={onFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
    </div>
  );
}
