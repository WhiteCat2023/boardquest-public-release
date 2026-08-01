import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
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
import {
  getCategoryIcon,
  IconPicker,
} from "@/view/admin/question_bank/components/IconPicker";
import {
  useLearningModules,
  useCreateLearningModule,
  useUpdateLearningModule,
  useDeleteLearningModule,
  type LearningModule,
} from "@/hooks/useLearningModules";
import {
  ArrowLeft,
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
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function SubjectDetailsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();

  const currentUserRole =
    (auth as any)?.data?.user?.role || (auth as any)?.user?.role;
  const canManage =
    currentUserRole === "SUPERADMIN" ||
    currentUserRole === "ADMIN" ||
    currentUserRole === "TEAMLEAD";

  const [activeTab, setActiveTab] = useState<"overview" | "modules">("overview");

  // Learning Modules Hooks
  const { data: modules = [], isLoading: isModulesLoading } =
    useLearningModules(categoryId || null);
  const createModuleMutation = useCreateLearningModule(categoryId || null);
  const updateModuleMutation = useUpdateLearningModule(categoryId || null);
  const deleteModuleMutation = useDeleteLearningModule(categoryId || null);

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

  // Subject Edit Modal State
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editSubjectIcon, setEditSubjectIcon] = useState("BookOpen");
  const [isEditingSubjectSubmitting, setIsEditingSubjectSubmitting] = useState(false);

  // Query Category Details
  const { data: category, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["categoryDetail", categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      const response = await axiosPrivate.get(
        `/questions/category/single/${categoryId}`
      );
      return response.data?.data?.category ?? response.data?.category ?? null;
    },
    enabled: !!categoryId,
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

  const handleOpenEditSubject = () => {
    if (!category) return;
    setEditSubjectName(category.name);
    setEditSubjectIcon(category.icon || "BookOpen");
    setIsEditSubjectOpen(true);
  };

  const handleUpdateSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !editSubjectName.trim()) return;

    setIsEditingSubjectSubmitting(true);
    try {
      await axiosPrivate.put(`/questions/category/single/${categoryId}`, {
        categoryId,
        name: editSubjectName.trim(),
        icon: editSubjectIcon,
      });
      toast.success("Subject updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["categoryDetail", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsEditSubjectOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update subject.");
    } finally {
      setIsEditingSubjectSubmitting(false);
    }
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
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full max-w-5xl mx-auto min-h-full font-sans bg-background text-foreground animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col gap-2.5 sticky top-0 bg-background/95 backdrop-blur-md pb-2.5 pt-1 -mt-1 z-10 border-b border-border/80">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/subject-management")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Subject Management
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0 shadow-2xs">
              <IconComp size={22} className="stroke-[2.2]" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground tracking-tight truncate">
                  {isCategoryLoading ? (
                    <Skeleton className="h-6 w-48" />
                  ) : (
                    category?.name || "Subject Details"
                  )}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-bold px-2 py-0 rounded-full shrink-0"
                >
                  <CheckCircle2 size={11} className="mr-1 inline" /> Active
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                ID: {categoryId || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {canManage && category && (
              <Button
                onClick={handleOpenEditSubject}
                variant="outline"
                className="rounded-lg border-border hover:bg-muted text-xs font-semibold px-3 h-8 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Pencil size={13} /> Edit Subject
              </Button>
            )}

            {/* Segmented Pill Tabs */}
            <div className="flex items-center p-1 bg-muted/60 border border-border/80 rounded-xl w-fit shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-card text-foreground shadow-2xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen size={13} />
                Overview
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("modules")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "modules"
                    ? "bg-card text-foreground shadow-2xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers size={13} />
                Learning Modules ({modules.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isCategoryLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : activeTab === "overview" ? (
        /* TAB 1: OVERVIEW */
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-card border border-border/80 rounded-xl flex items-center justify-between shadow-2xs hover:border-primary/30 transition-all text-left">
              <div className="space-y-1 min-w-0">
                <span className="text-xs font-semibold text-muted-foreground block truncate">
                  Evaluation Questions
                </span>
                <p className="text-2xl font-extrabold text-foreground tracking-tight">
                  {totalQuestions}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/question-bank")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-0.5"
                >
                  Question Bank <ArrowRight size={11} />
                </button>
              </div>
              <div className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl shrink-0">
                <HelpCircle size={20} />
              </div>
            </div>

            <div className="p-4 bg-card border border-border/80 rounded-xl flex items-center justify-between shadow-2xs hover:border-primary/30 transition-all text-left">
              <div className="space-y-1 min-w-0">
                <span className="text-xs font-semibold text-muted-foreground block truncate">
                  Learning Modules
                </span>
                <p className="text-2xl font-extrabold text-foreground tracking-tight">
                  {modules.length}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("modules")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-0.5"
                >
                  Curriculum modules <ArrowRight size={11} />
                </button>
              </div>
              <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl shrink-0">
                <Layers size={20} />
              </div>
            </div>

            <div className="p-4 bg-card border border-border/80 rounded-xl flex items-center justify-between shadow-2xs hover:border-primary/30 transition-all text-left">
              <div className="space-y-1 min-w-0">
                <span className="text-xs font-semibold text-muted-foreground block truncate">
                  Faculty Handlers
                </span>
                <p className="text-2xl font-extrabold text-foreground tracking-tight">
                  {category?.handlers?.length || 0}
                </p>
                <span className="text-[11px] text-muted-foreground block pt-0.5">
                  Assigned teachers
                </span>
              </div>
              <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-xl shrink-0">
                <Users size={20} />
              </div>
            </div>
          </div>

          {/* 2-Column Compact Layout for Audit & Handlers */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Subject Audit & Info Card (2 cols) */}
            <Card className="lg:col-span-2 p-4 bg-card border border-border/80 rounded-xl space-y-3 shadow-2xs h-full">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <h3 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5">
                  <BookOpen size={14} className="text-primary" /> Subject Audit Trail
                </h3>
                <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0">
                  Managed
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-muted/30 border border-border/60 rounded-lg flex items-center justify-between gap-2">
                  <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1.5">
                    <User size={13} className="text-primary" /> Created By
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px] shrink-0">
                      {(category?.author?.name?.[0] || "A").toUpperCase()}
                    </div>
                    <span className="font-bold text-foreground text-xs truncate">
                      {category?.author?.name || "System Admin"}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-muted/30 border border-border/60 rounded-lg flex items-center justify-between gap-2">
                  <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary" /> Created
                  </span>
                  <span className="font-bold text-foreground text-xs">
                    {formatDate(category?.createdAt)}
                  </span>
                </div>

                <div className="p-2.5 bg-muted/30 border border-border/60 rounded-lg flex items-center justify-between gap-2">
                  <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1.5">
                    <Clock size={13} className="text-primary" /> Modified
                  </span>
                  <span className="font-bold text-foreground text-xs">
                    {formatDate(category?.updatedAt)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Assigned Faculty Handlers Card (3 cols) */}
            <Card className="lg:col-span-3 p-4 bg-card border border-border/80 rounded-xl space-y-3 shadow-2xs h-full">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <h3 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-primary" /> Assigned Faculty Handlers
                </h3>
                <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0">
                  {category?.handlers?.length || 0} Member(s)
                </Badge>
              </div>

              {Array.isArray(category?.handlers) && category.handlers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {category.handlers.map((handler: any) => {
                    const initials = handler.name
                      ? handler.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "FC";
                    return (
                      <div
                        key={handler.id}
                        className="p-2.5 bg-muted/30 border border-border/60 rounded-lg flex items-center justify-between gap-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="size-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                              {handler.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {handler.email || "Faculty Member"}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[9px] font-semibold shrink-0 px-1.5 py-0">
                          {handler.role || "TEACHER"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 px-4 text-center border border-dashed border-border/80 rounded-lg flex flex-col items-center justify-center gap-1.5 bg-muted/20">
                  <Users size={26} className="text-muted-foreground/40 stroke-[1.5]" />
                  <p className="text-xs font-bold text-foreground">No Faculty Handlers Assigned</p>
                  <p className="text-[10px] text-muted-foreground max-w-xs">
                    No specific faculty members are explicitly assigned to this subject category yet.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        /* TAB 2: LEARNING MODULES */
        <div className="space-y-4 max-w-5xl animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BookOpen size={18} className="text-primary" /> Learning Curriculum Modules
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Curriculum learning materials and study modules for {category?.name}.
              </p>
            </div>

            {canManage && (
              <Button
                onClick={() => setIsAddModuleOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 h-10 text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
              >
                <Plus size={16} /> Add Learning Module
              </Button>
            )}
          </div>

          {/* Modules Grid / List */}
          {isModulesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : modules.length === 0 ? (
            <Card className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-3xl p-8 bg-card">
              <Layers size={44} className="text-muted-foreground/40 stroke-[1.5]" />
              <p className="font-bold text-foreground text-sm">No Learning Modules Added</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                No learning modules created yet for this subject category.
              </p>
              {canManage && (
                <Button
                  onClick={() => setIsAddModuleOpen(true)}
                  variant="outline"
                  className="rounded-xl text-xs font-semibold h-9 mt-1 border-border"
                >
                  <Plus size={14} className="mr-1.5" /> Create First Module
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {modules.map((mod, idx) => (
                <Card
                  key={mod.id}
                  className="p-5 bg-card hover:bg-muted/40 border border-border rounded-2xl flex items-start justify-between gap-4 transition-all group shadow-2xs"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="size-9 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-sm font-extrabold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <h4 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors truncate">
                        {mod.title}
                      </h4>
                      {mod.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {mod.description}
                        </p>
                      )}

                      {mod.fileUrl && (
                        <a
                          href={mod.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
                        >
                          <FileText size={13} /> View Material Attachment
                          <ExternalLink size={11} />
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
                        className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                        title="Edit Module"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingModule(mod)}
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Module"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Subject Modal */}
      {canManage && (
        <AlertDialog open={isEditSubjectOpen} onOpenChange={setIsEditSubjectOpen}>
          <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
            <form onSubmit={handleUpdateSubjectSubmit}>
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
                  Update subject title or icon.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="py-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Subject Title</label>
                  <Input
                    type="text"
                    required
                    placeholder="Subject Title"
                    value={editSubjectName}
                    onChange={(e) => setEditSubjectName(e.target.value)}
                    className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <IconPicker
                  selectedIcon={editSubjectIcon}
                  onSelectIcon={setEditSubjectIcon}
                />
              </div>

              <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
                <AlertDialogCancel
                  type="button"
                  onClick={() => setIsEditSubjectOpen(false)}
                  className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  type="submit"
                  disabled={isEditingSubjectSubmitting || !editSubjectName.trim()}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
                >
                  {isEditingSubjectSubmitting ? "Updating..." : "Update Subject"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}

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
    </div>
  );
}
