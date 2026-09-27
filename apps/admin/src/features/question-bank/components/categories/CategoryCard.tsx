import React from "react";
import { useNavigate } from "react-router-dom";
import { getCategoryIcon } from "../IconPicker";
import { CategoryActionButtons } from "./CategoryActionButtons";
import type { Category } from "../../api/useCategories";

interface CategoryCardProps {
  category: Category;
  canManage?: boolean;
  onEdit?: (category: Category) => void;
}

export function CategoryCard({
  category,
  canManage,
  onEdit,
}: CategoryCardProps) {
  const navigate = useNavigate();
  const targetId = category.id || category._id;
  const IconComp = getCategoryIcon(category.icon, category.name);

  const handleCardClick = () => {
    if (targetId) {
      navigate(`/subject-management/${targetId}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-card border border-border hover:border-primary/40 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group relative overflow-hidden font-sans cursor-pointer gap-4"
    >
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-emerald-500 opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Card Header */}
      <div className="flex items-center gap-3 min-w-0 pt-0.5">
        <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
          <IconComp size={20} className="stroke-[2.2]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className="text-xs sm:text-sm font-bold text-foreground tracking-tight truncate group-hover:text-primary transition-colors"
            title={category.name}
          >
            {category.name}
          </h3>
          <p className="text-[10.5px] text-muted-foreground font-medium truncate mt-0.5">
            {category.code || "Academic Subject Category"}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-2.5 border-t border-border flex items-center justify-between">
        <CategoryActionButtons
          category={category}
          canManage={canManage}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}

export default CategoryCard;
