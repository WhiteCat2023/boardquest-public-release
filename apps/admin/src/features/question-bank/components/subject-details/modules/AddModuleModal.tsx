import React, { useState } from "react";
import { Plus, Paperclip, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PdfPreviewModal } from "../PdfPreviewModal";
import { useModulePdfUpload } from "./useModulePdfUpload";
import ModulePdfDropzone from "./ModulePdfDropzone";
import ModulePdfList from "./ModulePdfList";

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
  const [manualUrl, setManualUrl] = useState("");
  const [showManualUrl, setShowManualUrl] = useState(false);

  const {
    files,
    isUploading,
    setIsUploading,
    uploadProgressText,
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
  } = useModulePdfUpload((firstFileName) => {
    if (!title.trim()) {
      const cleanTitle = firstFileName
        .replace(/\.pdf$/i, "")
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      setTitle(cleanTitle);
    }
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a module title.");
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrls = await uploadLocalFiles();

      const finalUrls = [...uploadedUrls];
      if (manualUrl.trim()) {
        finalUrls.push(manualUrl.trim());
      }

      await onSubmitModule({
        title: title.trim(),
        description: description.trim() || undefined,
        fileUrls: finalUrls.length > 0 ? finalUrls : undefined,
      });

      setTitle("");
      setDescription("");
      resetFiles();
      setManualUrl("");
      setShowManualUrl(false);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload files and save module.");
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = isParentPending || isUploading;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 bg-card border border-border shadow-2xl rounded-3xl text-foreground font-sans min-w-0">
          <form onSubmit={handleFormSubmit} className="space-y-4 w-full min-w-0">
            <DialogHeader className="text-left space-y-2 pb-1 border-b border-border/60 min-w-0">
              <div className="flex flex-row items-center gap-3 min-w-0">
                <div className="size-10 bg-primary/10 text-primary rounded-2xl border border-primary/15 flex items-center justify-center shrink-0">
                  <Plus size={20} className="stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base font-bold text-foreground truncate">
                    Add Learning Module
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                    Create curriculum material for{" "}
                    <strong className="text-foreground">{categoryName}</strong>.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3.5 pt-1 min-w-0">
              {/* Module Title */}
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-semibold text-foreground">
                  Module Title <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Module 1: Clinical Chemistry Fundamentals"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 bg-muted/30 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground w-full"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-semibold text-foreground">
                  Description (Optional)
                </label>
                <Textarea
                  placeholder="Brief summary of topics covered in this module..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[70px] resize-none bg-muted/30 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground w-full"
                />
              </div>

              {/* PDF Upload Drop Zone */}
              <div className="space-y-2 min-w-0">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Paperclip size={13} className="text-primary" /> Module PDF
                    Material(s)
                  </label>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Multiple files supported
                  </span>
                </div>

                <ModulePdfDropzone
                  fileInputRef={fileInputRef}
                  isDragging={isDragging}
                  onFilesAdded={handleFilesAdded}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                />
              </div>

              {/* Uploaded / Queued PDF Files List */}
              <ModulePdfList
                files={files}
                onPreview={setPreviewFile}
                onRemoveFile={handleRemoveFile}
                onClearAll={resetFiles}
              />

              {/* Optional Manual URL Toggle */}
              <div className="pt-1 min-w-0">
                {!showManualUrl ? (
                  <button
                    type="button"
                    onClick={() => setShowManualUrl(true)}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    + Or attach an external PDF link
                  </button>
                ) : (
                  <div className="space-y-1.5 p-3 bg-muted/20 border border-border rounded-xl min-w-0">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-foreground">
                        External PDF URL
                      </label>
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
                      className="h-9 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4 -mx-6 -mb-6 px-6 pb-6 bg-muted/20 rounded-b-3xl">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer shrink-0"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs gap-1.5 shrink-0"
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

export default AddModuleModal;
