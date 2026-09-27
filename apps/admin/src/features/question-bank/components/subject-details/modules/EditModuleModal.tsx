import React, { useState, useEffect } from "react";
import { Pencil, CheckCircle2, Loader2 } from "lucide-react";
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
import { type LearningModule } from "@/features/question-bank";
import { PdfPreviewModal } from "../PdfPreviewModal";
import { useModulePdfUpload } from "./useModulePdfUpload";
import ModulePdfDropzone from "./ModulePdfDropzone";
import ModulePdfList from "./ModulePdfList";

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
  const [description, setDescription] = useState(
    editingModule?.description || ""
  );
  const [existingUrls, setExistingUrls] = useState<string[]>([]);

  const {
    files: newFiles,
    isUploading,
    setIsUploading,
    uploadProgressText,
    isDragging,
    previewFile,
    setPreviewFile,
    fileInputRef,
    handleFilesAdded,
    handleRemoveFile: handleRemoveNewFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    uploadLocalFiles,
    resetFiles,
  } = useModulePdfUpload();

  useEffect(() => {
    if (editingModule) {
      setTitle(editingModule.title || "");
      setDescription(editingModule.description || "");
      const urls = Array.isArray(editingModule.fileUrls)
        ? editingModule.fileUrls
        : [];
      setExistingUrls(urls);
      resetFiles();
    }
  }, [editingModule]);

  const handleRemoveExistingUrl = (urlToRemove: string) => {
    setExistingUrls((prev) => prev.filter((u) => u !== urlToRemove));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !title.trim()) return;

    try {
      setIsUploading(true);
      const uploadedNewUrls = await uploadLocalFiles();
      const finalUrls = [...existingUrls, ...uploadedNewUrls];

      await onUpdateModule(editingModule.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        fileUrls: finalUrls,
      });

      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update module.");
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = isParentPending || isUploading;

  return (
    <>
      <Dialog open={!!editingModule} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 bg-card border border-border shadow-2xl rounded-3xl text-foreground font-sans min-w-0">
          <form onSubmit={handleFormSubmit} className="space-y-4 w-full min-w-0">
            <DialogHeader className="text-left space-y-2 pb-1 border-b border-border/60 min-w-0">
              <div className="flex flex-row items-center gap-3 min-w-0">
                <div className="size-10 bg-primary/10 text-primary rounded-2xl border border-primary/15 flex items-center justify-center shrink-0">
                  <Pencil size={20} className="stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base font-bold text-foreground truncate">
                    Edit Learning Module
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                    Update module details and attached PDF materials.
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
                  placeholder="Module Title"
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
                  placeholder="Brief description of module content"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[70px] resize-none bg-muted/30 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground w-full"
                />
              </div>

              {/* Existing Attached Materials */}
              <ModulePdfList
                existingUrls={existingUrls}
                title={`Current Materials (${existingUrls.length})`}
                onPreview={setPreviewFile}
                onRemoveUrl={handleRemoveExistingUrl}
              />

              {/* Upload Additional PDFs */}
              <div className="space-y-2 min-w-0">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Add More PDF Material(s)</span>
                  <span className="text-[10px] text-muted-foreground">Optional</span>
                </label>

                <ModulePdfDropzone
                  fileInputRef={fileInputRef}
                  isDragging={isDragging}
                  onFilesAdded={handleFilesAdded}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  variant="compact"
                />
              </div>

              {/* Queued new files */}
              <ModulePdfList
                files={newFiles}
                title={`New PDFs to upload (${newFiles.length})`}
                onPreview={setPreviewFile}
                onRemoveFile={handleRemoveNewFile}
              />
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

export default EditModuleModal;
