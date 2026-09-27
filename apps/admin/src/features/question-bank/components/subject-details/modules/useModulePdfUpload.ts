import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { uploadMultipleModulePdfs } from "../../../services/moduleUploadService";
import type { AttachedPdfItem } from "./moduleTypes";

export function useModulePdfUpload(onFirstFileAdded?: (firstFileName: string) => void) {
  const [files, setFiles] = useState<AttachedPdfItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(f.previewUrl);
        }
      });
    };
  }, [files]);

  const handleFilesAdded = (incomingFiles: FileList | File[]) => {
    const pdfList = Array.from(incomingFiles).filter(
      (f) =>
        f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );

    if (pdfList.length === 0) {
      toast.error("Please select valid PDF documents (.pdf).");
      return;
    }

    const newItems: AttachedPdfItem[] = pdfList.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...newItems]);

    if (onFirstFileAdded && newItems.length > 0) {
      onFirstFileAdded(newItems[0].name);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item && item.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const uploadLocalFiles = async (): Promise<string[]> => {
    const localFiles = files.filter((f) => f.file);
    const finalUrls: string[] = [];

    if (localFiles.length > 0) {
      setUploadProgressText(`Uploading ${localFiles.length} PDF file(s)...`);
      const fileObjects = localFiles.map((f) => f.file as File);
      const uploadedResults = await uploadMultipleModulePdfs(
        fileObjects,
        (completed, total) => {
          setUploadProgressText(`Uploading files (${completed}/${total})...`);
        }
      );
      for (const res of uploadedResults) {
        finalUrls.push(res.fileUrl);
      }
    }

    // Include existing remote URLs
    for (const item of files) {
      if (!item.file && item.url) {
        finalUrls.push(item.url);
      }
    }

    // Revoke blob URLs
    files.forEach((f) => {
      if (f.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });

    return finalUrls;
  };

  const resetFiles = () => {
    files.forEach((f) => {
      if (f.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });
    setFiles([]);
  };

  return {
    files,
    setFiles,
    isUploading,
    setIsUploading,
    uploadProgressText,
    setUploadProgressText,
    isDragging,
    previewFile,
    setPreviewFile,
    fileInputRef,
    handleFilesAdded,
    handleRemoveFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    uploadLocalFiles,
    resetFiles,
  };
}
