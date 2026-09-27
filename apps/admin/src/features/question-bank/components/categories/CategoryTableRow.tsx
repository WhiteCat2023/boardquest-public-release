import React from "react";
import { useNavigate } from "react-router-dom";
import { TableRow, TableCell } from "@/components/ui/table";
import { getCategoryIcon } from "../IconPicker";
import { CategoryActionButtons } from "./CategoryActionButtons";
import type { Category } from "../../api/useCategories";

interface CategoryTableRowProps {
  category: Category;
  canManage?: boolean;
  onEdit?: (category: Category) => void;
}

export function CategoryTableRow({
  category,
  canManage,
  onEdit,
}: CategoryTableRowProps) {
  const navigate = useNavigate();
  const targetId = category.id || category._id;
  const IconComp = getCategoryIcon(category.icon, category.name);

  const handleRowClick = () => {
    if (targetId) {
      navigate(`/subject-management/${targetId}`);
    }
  };

  return (
    <TableRow
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-muted/40 transition-colors group font-sans"
    >
      <TableCell className="py-3 pl-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
            <IconComp size={16} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span
              className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block truncate"
              title={category.name}
            >
              {category.name}
            </span>
            <span className="text-[10px] text-muted-foreground truncate block">
              {category.code || "Academic Subject Category"}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-3 pr-4 text-right">
        <CategoryActionButtons
          category={category}
          canManage={canManage}
          onEdit={onEdit}
        />
      </TableCell>
    </TableRow>
  );
}

export default CategoryTableRow;
