import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconPicker } from "../IconPicker";
import { useUpdateCategory } from "../../api/useUpdateCategory";

interface EditCategoryDialogProps {
  category: any | null;
  onClose: () => void;
}

export function EditCategoryDialog({
  category,
  onClose,
}: EditCategoryDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("BookOpen");
  const updateCategoryMutation = useUpdateCategory();

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setIcon(category.icon || "BookOpen");
    }
  }, [category]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !name.trim()) return;

    const targetId = category.id || category._id;

    try {
      await updateCategoryMutation.mutateAsync({
        categoryId: targetId,
        subjectId: targetId,
        name: name.trim(),
        icon,
      });
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <AlertDialog open={!!category} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
        <form onSubmit={handleUpdate}>
          <AlertDialogHeader className="text-left space-y-2">
            <div className="flex flex-row items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/15 shrink-0">
                <Pencil size={20} className="stroke-[2.5]" />
              </div>
              <AlertDialogTitle className="text-base font-bold text-foreground">
                Edit Subject
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Update subject title or icon presentation.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Subject Name *
              </label>
              <Input
                type="text"
                required
                placeholder="Subject Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <IconPicker selectedIcon={icon} onSelectIcon={setIcon} />
          </div>

          <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
            <AlertDialogCancel
              type="button"
              onClick={onClose}
              className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={updateCategoryMutation.isPending || !name.trim()}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
            >
              {updateCategoryMutation.isPending
                ? "Updating..."
                : "Update Subject"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EditCategoryDialog;
