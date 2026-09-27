import React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/modal";
import { useDeleteCategory, type Category } from "../../api/useCategories";

interface CategoryActionButtonsProps {
  category: Category;
  canManage?: boolean;
  onEdit?: (category: Category) => void;
}

export function CategoryActionButtons({
  category,
  canManage = false,
  onEdit,
}: CategoryActionButtonsProps) {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const deleteCategoryMutation = useDeleteCategory();
  const targetId = category.id || category._id;

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (targetId) {
      navigate(`/subject-management/${targetId}`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(category);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetId) return;

    const confirmed = await confirm({
      title: "Delete Subject Category",
      description: (
        <>
          Are you sure you want to delete{" "}
          <strong className="text-foreground">{category.name}</strong>? This action
          cannot be undone.
        </>
      ),
      variant: "destructive",
      confirmText: "Delete Subject",
    });

    if (!confirmed) return;

    try {
      await deleteCategoryMutation.mutateAsync(targetId);
    } catch {
      // Handled by toast in mutation
    }
  };

  return (
    <div
      className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleView}
        className="text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary h-7 rounded-md px-2.5 flex items-center gap-1 cursor-pointer"
      >
        <Eye size={12} /> View Details
      </Button>

      {canManage && (
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Edit Subject"
            >
              <Pencil size={13} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleteCategoryMutation.isPending}
            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
            title="Delete Subject"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      )}
    </div>
  );
}

export default CategoryActionButtons;
