import React, { useState } from "react";
import { Plus } from "lucide-react";
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
import useAuth from "@/hooks/useAuth";
import { IconPicker } from "../IconPicker";
import { useCreateCategory } from "../../api/useCategories";

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCategoryDialog({
  open,
  onOpenChange,
}: CreateCategoryDialogProps) {
  const { auth } = useAuth();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("BookOpen");
  const createCategoryMutation = useCreateCategory();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const authorId =
      (auth as any)?.data?.user?.id ||
      (auth as any)?.user?.id ||
      (auth as any)?.data?.id;

    try {
      await createCategoryMutation.mutateAsync({
        name: name.trim(),
        icon,
        authorId,
      });
      setName("");
      setIcon("BookOpen");
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
        <form onSubmit={handleCreate}>
          <AlertDialogHeader className="text-left space-y-2">
            <div className="flex flex-row items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/15 shrink-0">
                <Plus size={20} className="stroke-[2.5]" />
              </div>
              <AlertDialogTitle className="text-base font-bold text-foreground">
                Create Subject
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Add a new evaluation subject to the curriculum library.
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
                placeholder="e.g. Clinical Chemistry"
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
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={createCategoryMutation.isPending || !name.trim()}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
            >
              {createCategoryMutation.isPending
                ? "Creating..."
                : "Save Subject"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CreateCategoryDialog;
