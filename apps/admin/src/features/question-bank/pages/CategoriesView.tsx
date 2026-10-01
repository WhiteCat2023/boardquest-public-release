import React, { useState } from "react";
import useRoleFlags from "@/hooks/useRoleFlags";
import DataTablePagination from "@/components/custom/pagination/DataTablePagination";
import { useCategories, type Category } from "../api/useCategories";
import {
  CategoriesHeader,
  CategoryCardGrid,
  CategoryTable,
  CategoriesEmptyState,
  CreateCategoryDialog,
  EditCategoryDialog,
} from "../components/categories";

export default function CategoriesView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const ITEMS_PER_PAGE = 6;

  const { data: categories = [], isLoading } = useCategories({
    search: searchTerm,
  });
  const { isTeacher, isStaff: canManage } = useRoleFlags();

  const total = categories.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const hasNextPage = currentPage < totalPages;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = categories.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleNext = () => {
    if (hasNextPage) setCurrentPage((p) => p + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handlePageSelect = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200 font-sans">
      {/* Compact Header & Filter Toolbar */}
      <CategoriesHeader
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={categories.length}
        isTeacher={isTeacher}
        canManage={canManage}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Area */}
      {categories.length === 0 && !isLoading ? (
        <CategoriesEmptyState searchTerm={searchTerm} />
      ) : viewMode === "grid" ? (
        <>
          <CategoryCardGrid
            categories={paginatedCategories}
            isLoading={isLoading}
            canManage={canManage}
            onEdit={setEditingCategory}
          />
          {!isLoading && categories.length > 0 && (
            <DataTablePagination
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={currentPage > 1}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onPageSelect={handlePageSelect}
              totalPages={totalPages}
              totalItems={categories.length}
              pageSize={ITEMS_PER_PAGE}
              itemLabel="subjects"
              variant="card"
            />
          )}
        </>
      ) : (
        <CategoryTable
          categories={paginatedCategories}
          isLoading={isLoading}
          canManage={canManage}
          onEdit={setEditingCategory}
          pagination={
            !isLoading && categories.length > 0 ? (
              <DataTablePagination
                currentPage={currentPage}
                hasNextPage={hasNextPage}
                hasPreviousPage={currentPage > 1}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onPageSelect={handlePageSelect}
                totalPages={totalPages}
                totalItems={categories.length}
                pageSize={ITEMS_PER_PAGE}
                itemLabel="subjects"
                variant="table-footer"
              />
            ) : null
          }
        />
      )}

      {/* Create Subject Modal */}
      {canManage && (
        <CreateCategoryDialog
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
        />
      )}

      {/* Edit Subject Modal */}
      {canManage && (
        <EditCategoryDialog
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
}
