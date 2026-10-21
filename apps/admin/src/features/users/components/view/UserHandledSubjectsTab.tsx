import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Edit3, ChevronRight, Check, ShieldCheck } from "lucide-react";
import { showFeedback } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { getCategoryIcon } from "@/features/question-bank/components/IconPicker";
import { useSubjects, useUpdateUserSubjects } from "@/features/users/api/useUsers";
import type { UserMember } from "@/features/users/types/types";

interface UserHandledSubjectsTabProps {
  user: UserMember;
  canManageCategories?: boolean;
}

export default function UserHandledSubjectsTab({
  user,
  canManageCategories = false,
}: UserHandledSubjectsTabProps) {
  const navigate = useNavigate();
  const { data: allSubjects = [], isLoading: isSubjectsLoading } = useSubjects();
  const updateSubjectsMutation = useUpdateUserSubjects();

  const [isEditCategoriesOpen, setIsEditCategoriesOpen] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const existingIds =
        user.handledSubjects?.map((c) => c.id) ||
        user.handledSubjectIds ||
        user.handledCategories?.map((c) => c.id) ||
        user.handledCategoryIds ||
        [];
      setSelectedSubjectIds(existingIds);
    }
  }, [user]);

  const rawHandled = user.handledSubjects || user.handledCategories || [];
  const handledIds: string[] = Array.isArray(user.handledSubjectIds)
    ? user.handledSubjectIds
    : Array.isArray(user.handledCategoryIds)
    ? user.handledCategoryIds
    : [];

  const handledCategories =
    rawHandled.length > 0 &&
    typeof rawHandled[0] === "object" &&
    rawHandled[0]?.name
      ? rawHandled
      : allSubjects.filter((s: any) => handledIds.includes(s.id));

  const handleSaveCategories = async () => {
    try {
      await updateSubjectsMutation.mutateAsync({
        id: user.id,
        categoryIds: selectedSubjectIds,
        subjectIds: selectedSubjectIds,
      });
      setIsEditCategoriesOpen(false);
      showFeedback.success("Handled subjects updated successfully");
    } catch {
      showFeedback.error("Failed to update subjects");
    }
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const userRoleStr = String(user.role || "").toUpperCase();
  const isTeacher = userRoleStr === "TEACHER";
  const roleLabel =
    userRoleStr === "DEAN"
      ? "Dean"
      : userRoleStr === "TEAMLEAD"
      ? "Team Lead"
      : userRoleStr === "SUPERADMIN"
      ? "Super Admin"
      : user.role || "User";
  const canEdit = canManageCategories && isTeacher;

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200">
      <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                Handled Subjects & Categories
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isTeacher
                  ? "Licensure examination subject categories assigned to this teacher"
                  : `${roleLabel} accounts automatically oversee and handle all licensure examination subjects.`}
              </p>
            </div>

            {canEdit && (
              <Button
                onClick={() => setIsEditCategoriesOpen(true)}
                variant="outline"
                size="sm"
                className="rounded-xl border-border text-foreground hover:bg-indigo-500/10 hover:text-indigo-600 hover:border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit3 size={14} />
                Edit Subjects
              </Button>
            )}
          </div>

          {!isTeacher ? (
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    All Subjects & Categories (Global Access)
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold border-primary/30 text-primary bg-primary/10"
                    >
                      Auto-Handled
                    </Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                    As a <strong className="text-foreground">{roleLabel}</strong>, this account automatically oversees and handles all licensure examination subjects, modules, and questions across the curriculum. Manual subject assignment applies exclusively to Teacher roles.
                  </p>
                </div>
              </div>
            </div>
          ) : handledCategories.length > 0 ? (
            <div className="divide-y divide-border/60 border border-border/80 rounded-2xl overflow-hidden bg-card/60 shadow-2xs">
              {handledCategories.map((cat: any) => {
                const detailedCat =
                  allSubjects.find((s: any) => s.id === cat.id) || cat;
                const IconComp = getCategoryIcon(
                  detailedCat.icon,
                  detailedCat.name,
                );
                const questionsCount =
                  detailedCat._count?.questions ??
                  detailedCat.questionCount ??
                  null;
                const modulesCount =
                  detailedCat._count?.modules ??
                  detailedCat.moduleCount ??
                  null;

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      if (cat.id) {
                        navigate(`/subject-management/${cat.id}`);
                      }
                    }}
                    className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                        <IconComp size={18} className="stroke-[2.2]" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {detailedCat.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span>Licensure Subject</span>
                          {(questionsCount !== null ||
                            modulesCount !== null) && (
                            <>
                              <span>•</span>
                              <span>{questionsCount ?? 0} Questions</span>
                              <span>•</span>
                              <span>{modulesCount ?? 0} Modules</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full hidden sm:inline-flex"
                      >
                        Assigned Handler
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs text-muted-foreground group-hover:text-primary hover:bg-primary/10 rounded-lg gap-1 cursor-pointer font-semibold"
                      >
                        <span>View Subject</span>
                        <ChevronRight
                          size={14}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2 w-full bg-muted/20 rounded-2xl border border-border/60">
              <BookOpen
                size={28}
                className="text-muted-foreground/40 mb-0.5"
              />
              <p className="text-xs font-bold text-foreground">
                No Subjects Assigned
              </p>
              <p className="text-[11px] text-muted-foreground max-w-sm">
                This faculty member currently has no assigned subject
                categories.
                {canManageCategories &&
                  " Click 'Edit Subjects' above to assign categories."}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Edit Handled Subjects Modal */}
      <AlertDialog
        open={isEditCategoriesOpen}
        onOpenChange={setIsEditCategoriesOpen}
      >
        <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-lg text-foreground">
          <AlertDialogHeader className="flex flex-row items-start gap-3.5 text-left">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
              <BookOpen size={20} />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-base font-bold text-foreground">
                Manage Handled Subjects
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Select the licensure examination subject categories that{" "}
                <strong className="text-foreground">{user.name}</strong> is
                authorized to author and manage questions for.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <div className="py-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 my-1">
            {isSubjectsLoading ? (
              <div className="py-6 text-center text-xs text-muted-foreground animate-pulse font-medium">
                Loading available subjects...
              </div>
            ) : allSubjects.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                No subjects found in the curriculum.
              </p>
            ) : (
              allSubjects.map((cat: any) => {
                const isSelected = selectedSubjectIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategorySelection(cat.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-500/10 border-indigo-500/40 text-foreground ring-1 ring-indigo-500/20"
                        : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-xl border ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        <BookOpen size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{cat.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {cat.code || "Licensure Subject"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-border bg-background"
                      }`}
                    >
                      {isSelected && <Check size={12} className="stroke-[3]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={updateSubjectsMutation.isPending}
              className="rounded-xl border-border hover:bg-accent text-foreground text-xs font-semibold h-9"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveCategories}
              disabled={updateSubjectsMutation.isPending}
              className="rounded-xl text-xs font-semibold h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
            >
              {updateSubjectsMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
