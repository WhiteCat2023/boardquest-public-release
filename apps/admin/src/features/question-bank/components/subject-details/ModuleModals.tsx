import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type LearningModule } from "@/features/question-bank";
import {
  AlertTriangle,
  FileText,
  Pencil,
  Plus,
  UploadCloud,
  Eye,
  Trash2,
  Loader2,
  Paperclip,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import {
  uploadMultipleModulePdfs,
  formatFileSize,
  getFileNameFromUrl,
} from "../../services/moduleUploadService";
import { PdfPreviewModal } from "./PdfPreviewModal";
import { toast } from "sonner";

export interface AttachedPdfItem {
  id: string;
  name: string;
  size: number;
  file?: File;
  url?: string;
  previewUrl: string;
}

interface AddModuleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName?: string;
  isPending: boolean;
  onSubmitModule: (data: {
    title: string;
    description?: string;
    fileUrls?: string[];
  }) => Promise<void> | void;
}

export function AddModuleModal({
  isOpen,
  onOpenChange,
  categoryName,
  isPending: isParentPending,
  onSubmitModule,
}: AddModuleModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<AttachedPdfItem[]>([]);
  const [manualUrl, setManualUrl] = useState("");
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Preview modal state
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = (incomingFiles: FileList | File[]) => {
    const pdfList = Array.from(incomingFiles).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
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

    // Auto-populate title if empty using first file name
    if (!title.trim() && newItems.length > 0) {
      const cleanTitle = newItems[0].name
        .replace(/\.pdf$/i, "")
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      setTitle(cleanTitle);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item && item.previewUrl.startsWith("blob:")) {
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a module title.");
      return;
    }

    try {
      setIsUploading(true);
      const finalUrls: string[] = [];

      // 1. Upload any pending local files
      const localFiles = files.filter((f) => f.file);
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

      // 2. Include any existing remote URLs
      for (const item of files) {
        if (!item.file && item.url) {
          finalUrls.push(item.url);
        }
      }

      // 3. Include manual URL if provided
      if (manualUrl.trim()) {
        finalUrls.push(manualUrl.trim());
      }

      // Submit module
      await onSubmitModule({
        title: title.trim(),
        description: description.trim() || undefined,
        fileUrls: finalUrls.length > 0 ? finalUrls : undefined,
      });

      // Cleanup
      files.forEach((f) => {
        if (f.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(f.previewUrl);
        }
      });
      setTitle("");
      setDescription("");
      setFiles([]);
      setManualUrl("");
      setShowManualUrl(false);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload files and save module.");
    } finally {
      setIsUploading(false);
      setUploadProgressText("");
    }
  };

  const isSubmitting = isParentPending || isUploading;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 bg-card border border-border shadow-2xl rounded-3xl text-foreground font-sans">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <DialogHeader className="text-left space-y-2 pb-1 border-b border-border/60">
              <div className="flex flex-row items-center gap-3">
                <div className="size-10 bg-primary/10 text-primary rounded-2xl border border-primary/15 flex items-center justify-center shrink-0">
                  <Plus size={20} className="stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base font-bold text-foreground">
                    Add Learning Module
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Create curriculum material for <strong className="text-foreground">{categoryName}</strong>.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3.5 pt-1">
              {/* Module Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Module Title <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Module 1: Clinical Chemistry Fundamentals"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 bg-muted/30 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
                <Textarea
                  placeholder="Brief summary of topics covered in this module..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[70px] resize-none bg-muted/30 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* PDF Upload Drop Zone */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Paperclip size={13} className="text-primary" /> Module PDF Material(s)
                  </label>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Multiple files supported
                  </span>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
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
                        handleFilesAdded(e.target.files);
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
              </div>

              {/* Uploaded / Queued PDF Files List with PREVIEW BUTTONS */}
              {files.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground px-1">
                    <span>Selected Documents ({files.length})</span>
                    <button
                      type="button"
                      onClick={() => setFiles([])}
                      className="text-[10px] font-semibold text-destructive hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {files.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 bg-muted/40 border border-border rounded-xl gap-2 hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="size-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                            <FileText size={15} className="stroke-[2.5]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate" title={item.name}>
                              {item.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                              <span>{formatFileSize(item.size)}</span>
                              <span className="inline-block size-1 rounded-full bg-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* PREVIEW BUTTON */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewFile({ url: item.previewUrl, name: item.name });
                            }}
                            className="h-7 px-2.5 rounded-lg border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-xs font-bold gap-1 cursor-pointer shrink-0"
                            title="Preview PDF Document"
                          >
                            <Eye size={12} />
                            <span>Preview</span>
                          </Button>

                          {/* REMOVE BUTTON */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(item.id);
                            }}
                            className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                            title="Remove file"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Manual URL Toggle */}
              <div className="pt-1">
                {!showManualUrl ? (
                  <button
                    type="button"
                    onClick={() => setShowManualUrl(true)}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    + Or attach an external PDF link
                  </button>
                ) : (
                  <div className="space-y-1.5 p-3 bg-muted/20 border border-border rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-foreground">External PDF URL</label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowManualUrl(false);
                          setManualUrl("");
                        }}
                        className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <Input
                      type="url"
                      placeholder="https://example.com/curriculum-handbook.pdf"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      className="h-9 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4 -mx-6 -mb-6 px-6 pb-6 bg-muted/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>{uploadProgressText || "Saving Module..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Save Module</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Modal for items */}
      <PdfPreviewModal
        isOpen={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        fileUrl={previewFile?.url || null}
        fileName={previewFile?.name}
        title={previewFile?.name}
      />
    </>
  );
}

interface EditModuleModalProps {
  editingModule: LearningModule | null;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onUpdateModule: (
    moduleId: string,
    data: {
      title: string;
      description?: string;
      fileUrls?: string[];
    }
  ) => Promise<void> | void;
}

export function EditModuleModal({
  editingModule,
  onOpenChange,
  isPending: isParentPending,
  onUpdateModule,
}: EditModuleModalProps) {
  const [title, setTitle] = useState(editingModule?.title || "");
  const [description, setDescription] = useState(editingModule?.description || "");
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<AttachedPdfItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when editingModule opens
  React.useEffect(() => {
    if (editingModule) {
      setTitle(editingModule.title || "");
      setDescription(editingModule.description || "");
      const urls = Array.isArray(editingModule.fileUrls) ? editingModule.fileUrls : [];
      setExistingUrls(urls);
      setNewFiles([]);
    }
  }, [editingModule]);

  const handleFilesAdded = (incomingFiles: FileList | File[]) => {
    const pdfList = Array.from(incomingFiles).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
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

    setNewFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemoveNewFile = (id: string) => {
    setNewFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item && item.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleRemoveExistingUrl = (urlToRemove: string) => {
    setExistingUrls((prev) => prev.filter((u) => u !== urlToRemove));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !title.trim()) return;

    try {
      setIsUploading(true);
      const finalUrls = [...existingUrls];

      if (newFiles.length > 0) {
        setUploadProgressText(`Uploading ${newFiles.length} new PDF(s)...`);
        const fileObjects = newFiles.map((f) => f.file as File);
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

      await onUpdateModule(editingModule.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        fileUrls: finalUrls,
      });

      newFiles.forEach((f) => {
        if (f.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(f.previewUrl);
        }
      });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update module.");
    } finally {
      setIsUploading(false);
      setUploadProgressText("");
    }
  };

  const isSubmitting = isParentPending || isUploading;

  return (
    <>
      <Dialog open={!!editingModule} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 bg-card border border-border shadow-2xl rounded-3xl text-foreground font-sans">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <DialogHeader className="text-left space-y-2 pb-1 border-b border-border/60">
              <div className="flex flex-row items-center gap-3">
                <div className="size-10 bg-primary/10 text-primary rounded-2xl border border-primary/15 flex items-center justify-center shrink-0">
                  <Pencil size={20} className="stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base font-bold text-foreground">
                    Edit Learning Module
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Update module details and attached PDF materials.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3.5 pt-1">
              {/* Module Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Module Title <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Module Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 bg-muted/30 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
                <Textarea
                  placeholder="Brief description of module content"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[70px] resize-none bg-muted/30 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Existing Attached Materials with PREVIEW BUTTON */}
              {existingUrls.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Paperclip size={13} className="text-primary" /> Current Materials ({existingUrls.length})
                  </label>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {existingUrls.map((url, idx) => {
                      const docName = getFileNameFromUrl(url, `Material ${idx + 1}.pdf`);
                      return (
                        <div
                          key={url}
                          className="flex items-center justify-between p-2.5 bg-muted/40 border border-border rounded-xl gap-2 hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="size-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                              <FileText size={15} className="stroke-[2.5]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-foreground truncate" title={docName}>
                                {docName}
                              </p>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-primary hover:underline inline-flex items-center gap-1"
                              >
                                View original <ExternalLink size={9} />
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* PREVIEW BUTTON */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewFile({ url, name: docName })}
                              className="h-7 px-2.5 rounded-lg border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-xs font-bold gap-1 cursor-pointer shrink-0"
                              title="Preview PDF Document"
                            >
                              <Eye size={12} />
                              <span>Preview</span>
                            </Button>

                            {/* REMOVE BUTTON */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveExistingUrl(url)}
                              className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                              title="Remove material"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upload Additional PDFs */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Add More PDF Material(s)</span>
                  <span className="text-[10px] text-muted-foreground">Optional</span>
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files);
                  }}
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
                      if (e.target.files) handleFilesAdded(e.target.files);
                    }}
                  />
                  <UploadCloud size={20} className="text-primary" />
                  <p className="text-xs font-bold text-foreground">
                    Upload additional PDF files
                  </p>
                </div>
              </div>

              {/* Queued new files */}
              {newFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground">New PDFs to upload ({newFiles.length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {newFiles.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 bg-muted/40 border border-border rounded-xl gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="size-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                            <FileText size={15} className="stroke-[2.5]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate" title={item.name}>
                              {item.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{formatFileSize(item.size)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* PREVIEW BUTTON */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewFile({ url: item.previewUrl, name: item.name })}
                            className="h-7 px-2.5 rounded-lg border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-xs font-bold gap-1 cursor-pointer shrink-0"
                          >
                            <Eye size={12} /> Preview
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveNewFile(item.id)}
                            className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4 -mx-6 -mb-6 px-6 pb-6 bg-muted/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>{uploadProgressText || "Updating..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Update Module</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        fileUrl={previewFile?.url || null}
        fileName={previewFile?.name}
        title={previewFile?.name}
      />
    </>
  );
}

interface DeleteModuleModalProps {
  deletingModule: LearningModule | null;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => void;
}

export function DeleteModuleModal({
  deletingModule,
  onOpenChange,
  isPending,
  onConfirm,
}: DeleteModuleModalProps) {
  return (
    <AlertDialog open={!!deletingModule} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
        <AlertDialogHeader className="text-left space-y-2">
          <div className="flex flex-row items-center gap-3">
            <div className="p-2.5 bg-destructive/10 text-destructive rounded-2xl border border-destructive/15 shrink-0">
              <AlertTriangle size={20} className="stroke-[2.5]" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Delete Learning Module
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to delete <strong className="text-foreground">{deletingModule?.title}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
          >
            {isPending ? "Deleting..." : "Delete Module"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
