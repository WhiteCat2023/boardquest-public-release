import { Upload } from "lucide-react";

interface BulkCsvDropzoneProps {
  dragActive: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BulkCsvDropzone({
  dragActive,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
}: BulkCsvDropzoneProps) {
  return (
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
      <h3 className="text-sm font-bold text-foreground">Upload Student CSV File</h3>
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
  );
}
