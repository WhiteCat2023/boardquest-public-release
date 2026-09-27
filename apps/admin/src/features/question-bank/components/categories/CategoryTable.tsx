import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { CategoryTableRow } from "./CategoryTableRow";
import type { Category } from "../../api/useCategories";

interface CategoryTableProps {
  categories: Category[];
  isLoading?: boolean;
  canManage?: boolean;
  onEdit?: (category: Category) => void;
}

export function CategoryTable({
  categories,
  isLoading = false,
  canManage = false,
  onEdit,
}: CategoryTableProps) {
  if (isLoading) {
    return (
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-2xs divide-y divide-border/40 font-sans">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 pl-4 pr-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg bg-muted" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-44 bg-muted" />
                <Skeleton className="h-3 w-24 bg-muted" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-20 bg-muted rounded-md" />
              <Skeleton className="size-7 bg-muted rounded-lg" />
              <Skeleton className="size-7 bg-muted rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-2xs font-sans">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="border-b border-border/80 hover:bg-transparent">
            <TableHead className="text-xs font-bold text-muted-foreground py-3 pl-4">
              Subject
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground py-3 pr-4 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/60">
          {categories.map((cat) => (
            <CategoryTableRow
              key={cat.id || cat._id}
              category={cat}
              canManage={canManage}
              onEdit={onEdit}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default CategoryTable;
