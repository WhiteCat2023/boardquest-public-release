import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkle, Loader2 } from "lucide-react";
import type { GameBadge } from "../types/types";
import {
  BadgeArtworkSection,
  BadgeIdentitySection,
  BadgeUnlockCriteriaSection,
  BadgeLivePreviewCard,
  useBadgeEditorForm,
  BADGE_TYPES,
  BADGE_CATEGORIES,
  BOARDQUESTERS_PRESETS,
  ICONS,
} from "./badge-editor";

export { BADGE_TYPES, BADGE_CATEGORIES, BOARDQUESTERS_PRESETS, ICONS };

interface BadgeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge?: GameBadge | null;
  onSave: (badgeData: GameBadge) => void;
  isSaving?: boolean;
}

export function BadgeEditorModal({
  isOpen,
  onClose,
  badge,
  onSave,
  isSaving = false,
}: BadgeEditorModalProps) {
  const {
    formData,
    setFormData,
    uploadingImage,
    imagePreviewUrl,
    selectedFile,
    isCloudUploaded,
    dragOver,
    setDragOver,
    fileInputRef,
    handleTypeChange,
    handleFileSelect,
    handleRemoveImage,
    handleDrop,
    handleApplyPreset,
    handleSubmit,
  } = useBadgeEditorForm({ badge, isOpen, onSave });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] p-0 flex flex-col overflow-hidden bg-card border border-border/80 shadow-2xl rounded-2xl">
        {/* Modal Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/80 bg-accent/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/25 shadow-xs">
              <Sparkle className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                {badge ? "Edit Gamification Badge" : "Create Gamification Badge"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Configure badge metadata, upload Supabase Cloud Storage artwork,
                fallback icon, tier styling, XP reward, and unlock criteria.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <form
          id="badge-editor-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Inputs & Configuration (7 of 12 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-5">
              {/* Section 1: Badge Artwork & Iconography */}
              <BadgeArtworkSection
                imagePreviewUrl={imagePreviewUrl}
                selectedFile={selectedFile}
                isCloudUploaded={isCloudUploaded}
                uploadingImage={uploadingImage}
                dragOver={dragOver}
                selectedIconName={formData.iconName || "Medal"}
                fileInputRef={fileInputRef}
                imageUrl={formData.imageUrl}
                onFileSelect={handleFileSelect}
                onRemoveImage={handleRemoveImage}
                onSelectIcon={(iconName) =>
                  setFormData((prev) => ({ ...prev, iconName }))
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              />

              {/* Section 2: General Information */}
              <BadgeIdentitySection
                formData={formData}
                onUpdateField={(updates) =>
                  setFormData((prev) => ({ ...prev, ...updates }))
                }
                onTypeChange={handleTypeChange}
                onApplyPreset={handleApplyPreset}
              />

              {/* Section 3: Unlock Rules & Status */}
              <BadgeUnlockCriteriaSection
                triggerRule={formData.triggerRule}
                isActive={formData.isActive}
                onUpdateTriggerRule={(triggerRule) =>
                  setFormData((prev) => ({ ...prev, triggerRule }))
                }
                onToggleActive={(isActive) =>
                  setFormData((prev) => ({ ...prev, isActive }))
                }
              />
            </div>

            {/* Right Column: Live Interactive Preview (5 of 12 cols) */}
            <BadgeLivePreviewCard
              formData={formData}
              imagePreviewUrl={imagePreviewUrl}
              isCloudUploaded={isCloudUploaded}
            />
          </div>
        </form>

        {/* Modal Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border/80 bg-muted/40 shrink-0 gap-2 flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={uploadingImage || isSaving}
            className="h-9 text-xs font-semibold px-4 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="badge-editor-form"
            size="sm"
            disabled={uploadingImage || isSaving}
            className="h-9 text-xs font-bold gap-2 px-5 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
          >
            {uploadingImage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading
                Artwork...
              </>
            ) : isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Badge...
              </>
            ) : (
              <>
                <Sparkle className="w-4 h-4" />
                {badge ? "Save Changes" : "Create Badge"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BadgeEditorModal;
