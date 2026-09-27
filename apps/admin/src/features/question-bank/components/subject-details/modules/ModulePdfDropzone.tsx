import type { RefObject } from "react";
import { UploadCloud } from "lucide-react";

interface ModulePdfDropzoneProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  isDragging: boolean;
  onFilesAdded: (files: FileList | File[]) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  variant?: "standard" | "compact";
}

export default function ModulePdfDropzone({
  fileInputRef,
  isDragging,
  onFilesAdded,
  onDragOver,
  onDragLeave,
  onDrop,
  variant = "standard",
}: ModulePdfDropzoneProps) {
  if (variant === "compact") {
    return (
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50 hover:bg-muted/30 bg-muted/10"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFilesAdded(e.target.files);
            }
          }}
        />
        <UploadCloud size={20} className="text-primary" />
        <p className="text-xs font-bold text-foreground">
          Upload additional PDF files
        </p>
      </div>
    );
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
        isDragging
          ? "border-primary bg-primary/10 scale-[0.99]"
          : "border-border hover:border-primary/50 hover:bg-muted/30 bg-muted/10"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFilesAdded(e.target.files);
          }
        }}
      />
      <div className="size-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
        <UploadCloud size={20} />
      </div>
      <div>
        <p className="text-xs font-bold text-foreground">
          Click to browse or drag and drop PDF files
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Upload single or multiple PDF documents (up to 25MB each)
        </p>
      </div>
    </div>
  );
}
