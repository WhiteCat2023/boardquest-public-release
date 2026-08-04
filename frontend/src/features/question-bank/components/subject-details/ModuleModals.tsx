import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type LearningModule } from "@/features/question-bank";
import { AlertTriangle, Pencil, Plus } from "lucide-react";

interface AddModuleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName?: string;
  moduleTitle: string;
  onModuleTitleChange: (val: string) => void;
  moduleDescription: string;
  onModuleDescriptionChange: (val: string) => void;
  moduleFileUrl: string;
  onModuleFileUrlChange: (val: string) => void;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddModuleModal({
  isOpen,
  onOpenChange,
  categoryName,
  moduleTitle,
  onModuleTitleChange,
  moduleDescription,
  onModuleDescriptionChange,
  moduleFileUrl,
  onModuleFileUrlChange,
  isPending,
  onSubmit,
}: AddModuleModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
        <form onSubmit={onSubmit}>
          <AlertDialogHeader className="text-left space-y-2">
            <div className="flex flex-row items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/15 shrink-0">
                <Plus size={20} className="stroke-[2.5]" />
              </div>
              <AlertDialogTitle className="text-base font-bold text-foreground">
                Add Learning Module
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Create a new learning module for <strong className="text-foreground">{categoryName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Module Title *</label>
              <Input
                type="text"
                required
                placeholder="e.g. Module 1: Core Concepts"
                value={moduleTitle}
                onChange={(e) => onModuleTitleChange(e.target.value)}
                className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
              <Input
                type="text"
                placeholder="Brief description of module content"
                value={moduleDescription}
                onChange={(e) => onModuleDescriptionChange(e.target.value)}
                className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Attachment / File URL (Optional)</label>
              <Input
                type="url"
                placeholder="https://example.com/module-material.pdf"
                value={moduleFileUrl}
                onChange={(e) => onModuleFileUrlChange(e.target.value)}
                className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !moduleTitle.trim()}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
            >
              {isPending ? "Adding..." : "Save Module"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface EditModuleModalProps {
  editingModule: LearningModule | null;
  onOpenChange: (open: boolean) => void;
  editModuleTitle: string;
  onEditModuleTitleChange: (val: string) => void;
  editModuleDescription: string;
  onEditModuleDescriptionChange: (val: string) => void;
  editModuleFileUrl: string;
  onEditModuleFileUrlChange: (val: string) => void;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditModuleModal({
  editingModule,
  onOpenChange,
  editModuleTitle,
  onEditModuleTitleChange,
  editModuleDescription,
  onEditModuleDescriptionChange,
  editModuleFileUrl,
  onEditModuleFileUrlChange,
  isPending,
  onSubmit,
}: EditModuleModalProps) {
  return (
    <AlertDialog open={!!editingModule} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
        <form onSubmit={onSubmit}>
          <AlertDialogHeader className="text-left space-y-2">
            <div className="flex flex-row items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/15 shrink-0">
                <Pencil size={20} className="stroke-[2.5]" />
              </div>
              <AlertDialogTitle className="text-base font-bold text-foreground">
                Edit Learning Module
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Update module details for this subject.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Module Title *</label>
              <Input
                type="text"
                required
                placeholder="Module Title"
                value={editModuleTitle}
                onChange={(e) => onEditModuleTitleChange(e.target.value)}
                className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
              <Input
                type="text"
                placeholder="Brief description of module content"
                value={editModuleDescription}
                onChange={(e) => onEditModuleDescriptionChange(e.target.value)}
                className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Attachment / File URL (Optional)</label>
              <Input
                type="url"
                placeholder="https://example.com/module-material.pdf"
                value={editModuleFileUrl}
                onChange={(e) => onEditModuleFileUrlChange(e.target.value)}
                className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !editModuleTitle.trim()}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
            >
              {isPending ? "Updating..." : "Update Module"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
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
