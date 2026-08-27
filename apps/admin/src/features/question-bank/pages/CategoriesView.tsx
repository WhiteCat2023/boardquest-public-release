import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubjects } from "@/features/users";
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
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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
import { IconPicker, getCategoryIcon } from "../components/IconPicker";
import useRoleFlags from "@/hooks/useRoleFlags";
import { useConfirm } from "@/components/modal";

export default function CategoriesView() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { data: categories = [], isLoading } = useSubjects({
    search: searchTerm,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("BookOpen");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryIcon, setEditCategoryIcon] = useState("BookOpen");
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);

  const { confirm } = useConfirm();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const {
    currentUser,
    isTeacher,
    isStaff: canManage,
    handledCategoryIds,
    isSubjectAssigned,
  } = useRoleFlags();

  const filteredCategories = categories;

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
        },
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

  const handleDeleteCategory = async (cat: any) => {
    const confirmed = await confirm({
      title: "Delete Subject Category",
      description: (
        <>
          Are you sure you want to delete{" "}
          <strong className="text-foreground">{cat?.name}</strong>? This action
          cannot be undone.
        </>
      ),
      variant: "destructive",
      confirmText: "Delete Subject",
    });

    if (!confirmed) return;

    try {
      await axiosPrivate.delete(`/questions/category/single/${cat.id}`);
      toast.success(`Category "${cat.name}" deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete category.");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200 font-sans">
      {/* Compact Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card border border-border p-2.5 px-3 rounded-xl shadow-2xs font-sans w-full">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
          <Input
            type="text"
            placeholder="Search subject or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 h-8.5 bg-muted/30 border border-border rounded-lg text-xs focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground placeholder:text-muted-foreground w-full"
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
        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/40 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-card text-primary shadow-2xs font-bold border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Cards View"
              aria-label="Cards View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-card text-primary shadow-2xs font-bold border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
              aria-label="List View"
            >
              <List size={14} />
            </button>
          </div>

          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">
            {isTeacher ? "Handled Subjects" : "Total Subjects"}:{" "}
            {filteredCategories.length}
          </span>

          {canManage && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-3 h-8.5 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add Subject
            </Button>
          )}
        </div>
      </div>

      {/* Content Rendering: Grid vs List */}
      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-4 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-xl bg-muted" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32 bg-muted rounded-md" />
                    <Skeleton className="h-3 w-20 bg-muted rounded-md" />
                  </div>
                </div>
                <div className="pt-2.5 flex justify-between items-center border-t border-border/50">
                  <Skeleton className="h-6 w-20 bg-muted rounded-md" />
                  <div className="flex items-center gap-1">
                    <Skeleton className="size-7 bg-muted rounded-md" />
                    <Skeleton className="size-7 bg-muted rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-2xs divide-y divide-border/40">
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
        )
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
      ) : viewMode === "grid" ? (
        /* Cards / Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCategories.map((cat: any) => {
            const IconComp = getCategoryIcon(cat.icon, cat.name);
            const targetId = cat.id || cat._id;

            return (
              <div
                key={targetId}
                onClick={() => {
                  if (targetId) {
                    navigate(`/subject-management/${targetId}`);
                  }
                }}
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
                      title={cat.name}
                    >
                      {cat.name}
                    </h3>
                    <p className="text-[10.5px] text-muted-foreground font-medium truncate mt-0.5">
                      {cat.code || "Academic Subject Category"}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2.5 border-t border-border flex items-center justify-between">
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
                          handleDeleteCategory(cat);
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
      ) : (
        /* List / Table View */
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-2xs">
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
              {filteredCategories.map((cat: any) => {
                const IconComp = getCategoryIcon(cat.icon, cat.name);
                const targetId = cat.id || cat._id;

                return (
                  <TableRow
                    key={targetId}
                    onClick={() => {
                      if (targetId) navigate(`/subject-management/${targetId}`);
                    }}
                    className="cursor-pointer hover:bg-muted/40 transition-colors group"
                  >
                    <TableCell className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                          <IconComp size={16} className="stroke-[2.2]" />
                        </div>
                        <div className="min-w-0">
                          <span
                            className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block truncate"
                            title={cat.name}
                          >
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate block">
                            {cat.code || "Academic Subject Category"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 pr-4 text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (targetId)
                              navigate(`/subject-management/${targetId}`);
                          }}
                          className="text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary h-7 rounded-md px-2.5 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} /> View Details
                        </Button>
                        {canManage && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditModal(cat)}
                              className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                              title="Edit Subject"
                            >
                              <Pencil size={13} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(cat)}
                              className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Subject"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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

      {/* Edit Subject Modal */}
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
    </div>
  );
}
