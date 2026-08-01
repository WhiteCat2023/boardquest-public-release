import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/view/admin/faculty/hooks/useFaculty";
import {
  Tag,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  HelpCircle,
  Users,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconPicker, getCategoryIcon } from "./IconPicker";

export default function CategoriesView() {
  const navigate = useNavigate();
  const { data: categories = [], isLoading } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("BookOpen");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryIcon, setEditCategoryIcon] = useState("BookOpen");
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);

  // Delete State
  const [deletingCategory, setDeletingCategory] = useState<any | null>(null);
  const [isDeletingSubmitting, setIsDeletingSubmitting] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const currentUserRole =
    (auth as any)?.data?.user?.role || (auth as any)?.user?.role;

  const canManage =
    currentUserRole === "SUPERADMIN" ||
    currentUserRole === "ADMIN" ||
    currentUserRole === "TEAMLEAD";

  const filteredCategories = categories.filter((cat: any) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const authorId =
      (auth as any)?.data?.user?.id ||
      (auth as any)?.user?.id ||
      (auth as any)?.data?.id;

    setIsSubmitting(true);
    try {
      await axiosPrivate.post("/questions/category/create", {
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
        authorId,
      });
      toast.success(`Category "${newCategoryName}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewCategoryName("");
      setNewCategoryIcon("BookOpen");
      setIsAddModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (cat: any) => {
    setEditingCategory(cat);
    setEditCategoryName(cat.name);
    setEditCategoryIcon(cat.icon || "BookOpen");
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryName.trim()) return;

    setIsEditingSubmitting(true);
    try {
      await axiosPrivate.put(
        `/questions/category/single/${editingCategory.id}`,
        {
          categoryId: editingCategory.id,
          name: editCategoryName.trim(),
          icon: editCategoryIcon,
        }
      );
      toast.success(`Category updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update category.");
    } finally {
      setIsEditingSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    setIsDeletingSubmitting(true);
    try {
      await axiosPrivate.delete(
        `/questions/category/single/${deletingCategory.id}`
      );
      toast.success(
        `Category "${deletingCategory.name}" deleted successfully!`
      );
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeletingCategory(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete category.");
    } finally {
      setIsDeletingSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200 font-sans">
      {/* Compact Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-card border border-border p-2.5 px-3.5 rounded-xl shadow-2xs font-sans">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
          <Input
            type="text"
            placeholder="Search subject category or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 h-8 bg-muted/30 border border-border rounded-lg text-xs focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground placeholder:text-muted-foreground"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Action Controls & Stats */}
        <div className="flex items-center gap-2.5 shrink-0 justify-between md:justify-end">
          <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border">
            Total Subjects: {filteredCategories.length}
          </span>

          {canManage && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-3.5 h-8 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add Subject Category
            </Button>
          )}
        </div>
      </div>

      {/* Grid of Subject Categories */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-3.5 space-y-3 min-h-[140px]"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-28 bg-muted rounded-md" />
                <Skeleton className="h-5 w-14 bg-muted rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-40 bg-muted rounded-md" />
              <div className="pt-3 flex justify-between items-center border-t border-border/50">
                <Skeleton className="h-4 w-20 bg-muted rounded-md" />
                <Skeleton className="h-4 w-12 bg-muted rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card className="py-14 text-center flex flex-col items-center justify-center gap-2.5 bg-card border border-border rounded-xl p-6 shadow-2xs">
          <Tag size={36} className="text-muted-foreground/40 stroke-[1.5]" />
          <p className="font-bold text-foreground text-xs">No Subjects Found</p>
          <p className="text-[11px] max-w-xs text-muted-foreground">
            {searchTerm
              ? `No subject categories match "${searchTerm}".`
              : "No subject categories created yet."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCategories.map((cat: any) => {
            const IconComp = getCategoryIcon(cat.icon, cat.name);
            const questionCount =
              typeof cat.questionCount === "number"
                ? cat.questionCount
                : cat.questions?.length ?? 0;
            const targetId = cat.id || cat._id;

            return (
              <div
                key={targetId}
                onClick={() => {
                  if (targetId) {
                    navigate(`/subject-management/${targetId}`);
                  }
                }}
                className="bg-card border border-border hover:border-primary/30 rounded-xl p-3.5 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group relative overflow-hidden font-sans cursor-pointer"
              >
                {/* Decorative Top Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-emerald-500 opacity-80 group-hover:opacity-100 transition-opacity" />

                {/* Card Header & Badges */}
                <div className="space-y-3 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                        <IconComp size={18} className="stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="text-xs font-bold text-foreground tracking-tight truncate group-hover:text-primary transition-colors"
                          title={cat.name}
                        >
                          {cat.name}
                        </h3>
                        <span className="inline-block mt-0.5 text-[9.5px] font-mono font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border truncate max-w-[130px]">
                          ID: {targetId?.slice(-6) || "CAT"}
                        </span>
                      </div>
                    </div>

                    <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} className="text-emerald-500" />{" "}
                      Active
                    </span>
                  </div>

                  {/* Summary Metric Rows (11px text) */}
                  <div className="pt-2.5 border-t border-border space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <HelpCircle size={12} /> Questions
                      </span>
                      <span className="font-semibold text-foreground">
                        {questionCount}{" "}
                        {questionCount === 1 ? "Question" : "Questions"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <Users size={12} /> Faculty Handlers
                      </span>
                      <span className="font-semibold text-foreground">
                        {cat.handlers?.length || 0} Assigned
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <User size={12} /> Author
                      </span>
                      <span
                        className="font-semibold text-foreground truncate max-w-[120px]"
                        title={cat.author?.name || "System Admin"}
                      >
                        {cat.author?.name || "System Admin"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2.5 border-t border-border mt-3 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (targetId) navigate(`/subject-management/${targetId}`);
                    }}
                    className="text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary h-7 rounded-md px-2.5 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={12} /> View Details
                  </Button>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(cat);
                        }}
                        className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                        title="Edit Subject"
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingCategory(cat);
                        }}
                        className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Subject Category Modal */}
      {canManage && (
        <AlertDialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
            <form onSubmit={handleCreateCategory}>
              <AlertDialogHeader className="text-left space-y-2">
                <div className="flex flex-row items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/15 shrink-0">
                    <Plus size={20} className="stroke-[2.5]" />
                  </div>
                  <AlertDialogTitle className="text-base font-bold text-foreground">
                    Create Subject Category
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-xs text-muted-foreground">
                  Add a new evaluation subject category to the curriculum library.
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
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <IconPicker
                  selectedIcon={newCategoryIcon}
                  onSelectIcon={setNewCategoryIcon}
                />
              </div>

              <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
                <AlertDialogCancel
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
                >
                  Cancel
                </AlertDialogCancel>
                <Button
                  type="submit"
                  disabled={isSubmitting || !newCategoryName.trim()}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? "Creating..." : "Save Subject"}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Edit Subject Category Modal */}
      {canManage && (
        <AlertDialog
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
        >
          <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
            <form onSubmit={handleUpdateCategory}>
              <AlertDialogHeader className="text-left space-y-2">
                <div className="flex flex-row items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/15 shrink-0">
                    <Pencil size={20} className="stroke-[2.5]" />
                  </div>
                  <AlertDialogTitle className="text-base font-bold text-foreground">
                    Edit Subject Category
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
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <IconPicker
                  selectedIcon={editCategoryIcon}
                  onSelectIcon={setEditCategoryIcon}
                />
              </div>

              <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
                <AlertDialogCancel
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
                >
                  Cancel
                </AlertDialogCancel>
                <Button
                  type="submit"
                  disabled={isEditingSubmitting || !editCategoryName.trim()}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
                >
                  {isEditingSubmitting ? "Updating..." : "Update Subject"}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Subject Category Dialog */}
      {canManage && (
        <AlertDialog
          open={!!deletingCategory}
          onOpenChange={(open) => !open && setDeletingCategory(null)}
        >
          <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
            <AlertDialogHeader className="text-left space-y-2">
              <div className="flex flex-row items-center gap-3">
                <div className="p-2.5 bg-destructive/10 text-destructive rounded-2xl border border-destructive/15 shrink-0">
                  <AlertTriangle size={20} className="stroke-[2.5]" />
                </div>
                <AlertDialogTitle className="text-base font-bold text-foreground">
                  Delete Subject Category
                </AlertDialogTitle>
              </div>

              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-foreground">
                  {deletingCategory?.name}
                </strong>
                ? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4 mt-2">
              <AlertDialogCancel
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="button"
                onClick={handleDeleteCategory}
                disabled={isDeletingSubmitting}
                className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
              >
                {isDeletingSubmitting ? "Deleting..." : "Delete Subject"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
