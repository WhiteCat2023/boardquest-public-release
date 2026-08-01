import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryIcon } from "./IconPicker";
import {
  useLearningModules,
  useCreateLearningModule,
  useUpdateLearningModule,
  useDeleteLearningModule,
  type LearningModule,
} from "@/hooks/useLearningModules";
import {
  BookOpen,
  Calendar,
  User,
  HelpCircle,
  Users,
  Pencil,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface SubjectDetailModalProps {
  categoryId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (category: any) => void;
  canManage?: boolean;
}

export function SubjectDetailModal({
  categoryId,
  isOpen,
  onClose,
  onEdit,
  canManage,
}: SubjectDetailModalProps) {
  const axiosPrivate = useAxiosPrivate();
  const [activeTab, setActiveTab] = useState<"overview" | "modules">("overview");

  // Learning Modules Hooks
  const { data: modules = [], isLoading: isModulesLoading } =
    useLearningModules(categoryId);
  const createModuleMutation = useCreateLearningModule(categoryId);
  const updateModuleMutation = useUpdateLearningModule(categoryId);
  const deleteModuleMutation = useDeleteLearningModule(categoryId);

  // Module Modal States
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleFileUrl, setModuleFileUrl] = useState("");

  const [editingModule, setEditingModule] = useState<LearningModule | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");
  const [editModuleDescription, setEditModuleDescription] = useState("");
  const [editModuleFileUrl, setEditModuleFileUrl] = useState("");

  const [deletingModule, setDeletingModule] = useState<LearningModule | null>(null);

  const { data: category, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["categoryDetail", categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      const response = await axiosPrivate.get(
        `/questions/category/single/${categoryId}`
      );
      return response.data?.data?.category ?? response.data?.category ?? null;
    },
    enabled: !!categoryId && isOpen,
    staleTime: 1000 * 60 * 2,
  });

  const IconComp = category
    ? getCategoryIcon(category.icon, category.name)
    : BookOpen;

  const totalQuestions =
    typeof category?._count?.questions === "number"
      ? category._count.questions
      : Array.isArray(category?.questions)
      ? category.questions.length
      : 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCreateModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    createModuleMutation.mutate(
      {
        title: moduleTitle.trim(),
        description: moduleDescription.trim() || undefined,
        fileUrl: moduleFileUrl.trim() || undefined,
        order: modules.length + 1,
      },
      {
        onSuccess: () => {
          setModuleTitle("");
          setModuleDescription("");
          setModuleFileUrl("");
          setIsAddModuleOpen(false);
        },
      }
    );
  };

  const handleOpenEditModule = (mod: LearningModule) => {
    setEditingModule(mod);
    setEditModuleTitle(mod.title);
    setEditModuleDescription(mod.description || "");
    setEditModuleFileUrl(mod.fileUrl || "");
  };

  const handleUpdateModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !editModuleTitle.trim()) return;

    updateModuleMutation.mutate(
      {
        moduleId: editingModule.id,
        data: {
          title: editModuleTitle.trim(),
          description: editModuleDescription.trim() || undefined,
          fileUrl: editModuleFileUrl.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setEditingModule(null);
        },
      }
    );
  };

  const handleDeleteModuleConfirm = () => {
    if (!deletingModule) return;
    deleteModuleMutation.mutate(deletingModule.id, {
      onSuccess: () => setDeletingModule(null),
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-card rounded-3xl p-6 border border-border shadow-2xl max-w-lg text-foreground font-sans sm:max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <DialogHeader className="space-y-3 text-left border-b border-border pb-3 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20 shrink-0 shadow-2xs">
                  <IconComp size={24} className="stroke-[2.2]" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <DialogTitle className="text-lg font-bold text-foreground leading-snug truncate">
                    {isCategoryLoading ? (
                      <Skeleton className="h-5 w-44" />
                    ) : (
                      category?.name || "Subject Details"
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>Subject Category</span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">
                      {modules.length} {modules.length === 1 ? "Module" : "Modules"}
                    </span>
                  </DialogDescription>
                </div>
              </div>

              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
              >
                <CheckCircle2 size={12} className="mr-1 inline" /> Active
              </Badge>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("modules")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "modules"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
                }`}
              >
                <Layers size={13} />
                Learning Modules ({modules.length})
              </button>
            </div>
          </DialogHeader>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto py-3 pr-1 space-y-4">
            {isCategoryLoading ? (
              <div className="py-6 space-y-3">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ) : activeTab === "overview" ? (
              /* TAB 1: OVERVIEW */
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-muted/30 border border-border rounded-2xl flex items-center gap-3">
                    <div className="p-2.5 bg-card border border-border text-primary rounded-xl shrink-0">
                      <HelpCircle size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        Total Questions
                      </p>
                      <p className="text-base font-extrabold text-foreground">
                        {totalQuestions}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-muted/30 border border-border rounded-2xl flex items-center gap-3">
                    <div className="p-2.5 bg-card border border-border text-primary rounded-xl shrink-0">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        Assigned Faculty
                      </p>
                      <p className="text-base font-extrabold text-foreground">
                        {category?.handlers?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata List */}
                <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <User size={14} /> Created By
                    </span>
                    <span className="font-semibold text-foreground">
                      {category?.author?.name || "System Admin"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Calendar size={14} /> Date Created
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatDate(category?.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Calendar size={14} /> Last Modified
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatDate(category?.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Assigned Handlers */}
                {Array.isArray(category?.handlers) && category.handlers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5">
                      <Users size={14} className="text-primary" /> Assigned Faculty Handlers
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {category.handlers.map((handler: any) => (
                        <Badge
                          key={handler.id}
                          variant="outline"
                          className="bg-card border-border text-foreground text-xs py-1 px-2.5 rounded-xl font-medium"
                        >
                          {handler.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* TAB 2: LEARNING MODULES */
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <BookOpen size={15} className="text-primary" /> Learning Curriculum Modules
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Manage modules and learning materials for {category?.name}.
                    </p>
                  </div>

                  {canManage && (
                    <Button
                      onClick={() => setIsAddModuleOpen(true)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-3 h-8 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                    >
                      <Plus size={14} /> Add Module
                    </Button>
                  )}
                </div>

                {/* Modules List */}
                {isModulesLoading ? (
                  <div className="space-y-2.5">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : modules.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center gap-2.5 border border-dashed border-border rounded-2xl p-6 bg-muted/20">
                    <Layers size={36} className="text-muted-foreground/40 stroke-[1.5]" />
                    <p className="font-bold text-foreground text-xs">No Learning Modules Added</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                      No learning modules created yet for this subject category.
                    </p>
                    {canManage && (
                      <Button
                        onClick={() => setIsAddModuleOpen(true)}
                        variant="outline"
                        className="rounded-xl text-xs font-semibold h-8 mt-1 border-border"
                      >
                        <Plus size={13} className="mr-1" /> Add First Module
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {modules.map((mod, idx) => (
                      <div
                        key={mod.id}
                        className="p-3.5 bg-muted/30 hover:bg-muted/60 border border-border rounded-2xl flex items-start justify-between gap-3 transition-all group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="size-7 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors truncate">
                              {mod.title}
                            </h4>
                            {mod.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-normal">
                                {mod.description}
                              </p>
                            )}

                            {mod.fileUrl && (
                              <a
                                href={mod.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-primary hover:underline pt-0.5"
                              >
                                <FileText size={12} /> View Material Attachment
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>

                        {canManage && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditModule(mod)}
                              className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                              title="Edit Module"
                            >
                              <Pencil size={13} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingModule(mod)}
                              className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Module"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between border-t border-border pt-3 mt-2 shrink-0">
            {canManage && category && onEdit ? (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onEdit(category);
                }}
                className="rounded-xl border-border hover:bg-muted text-xs font-semibold px-4 h-9 flex items-center gap-2 cursor-pointer"
              >
                <Pencil size={14} /> Edit Subject
              </Button>
            ) : (
              <div />
            )}

            <Button
              onClick={onClose}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-5 h-9 cursor-pointer"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Module Modal */}
      {canManage && (
        <AlertDialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
          <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
            <form onSubmit={handleCreateModuleSubmit}>
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
                  Create a new learning module for <strong className="text-foreground">{category?.name}</strong>.
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
                    onChange={(e) => setModuleTitle(e.target.value)}
                    className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
                  <Input
                    type="text"
                    placeholder="Brief description of module content"
                    value={moduleDescription}
                    onChange={(e) => setModuleDescription(e.target.value)}
                    className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Attachment / File URL (Optional)</label>
                  <Input
                    type="url"
                    placeholder="https://example.com/module-material.pdf"
                    value={moduleFileUrl}
                    onChange={(e) => setModuleFileUrl(e.target.value)}
                    className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
                <AlertDialogCancel
                  type="button"
                  onClick={() => setIsAddModuleOpen(false)}
                  className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  type="submit"
                  disabled={createModuleMutation.isPending || !moduleTitle.trim()}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
                >
                  {createModuleMutation.isPending ? "Adding..." : "Save Module"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Edit Module Modal */}
      {canManage && (
        <AlertDialog
          open={!!editingModule}
          onOpenChange={(open) => !open && setEditingModule(null)}
        >
          <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
            <form onSubmit={handleUpdateModuleSubmit}>
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
                    onChange={(e) => setEditModuleTitle(e.target.value)}
                    className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
                  <Input
                    type="text"
                    placeholder="Brief description of module content"
                    value={editModuleDescription}
                    onChange={(e) => setEditModuleDescription(e.target.value)}
                    className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Attachment / File URL (Optional)</label>
                  <Input
                    type="url"
                    placeholder="https://example.com/module-material.pdf"
                    value={editModuleFileUrl}
                    onChange={(e) => setEditModuleFileUrl(e.target.value)}
                    className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
                <AlertDialogCancel
                  type="button"
                  onClick={() => setEditingModule(null)}
                  className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  type="submit"
                  disabled={updateModuleMutation.isPending || !editModuleTitle.trim()}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
                >
                  {updateModuleMutation.isPending ? "Updating..." : "Update Module"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Module Dialog */}
      {canManage && (
        <AlertDialog
          open={!!deletingModule}
          onOpenChange={(open) => !open && setDeletingModule(null)}
        >
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
              <AlertDialogCancel
                type="button"
                onClick={() => setDeletingModule(null)}
                className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="button"
                onClick={handleDeleteModuleConfirm}
                disabled={deleteModuleMutation.isPending}
                className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
              >
                {deleteModuleMutation.isPending ? "Deleting..." : "Delete Module"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

