import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import useAuth from "@/hooks/useAuth";
import {
  useCategoryDetail,
  useUpdateCategory,
  useLearningModules,
  useCreateLearningModule,
  useUpdateLearningModule,
  useDeleteLearningModule,
  useTopics,
  type LearningModule,
} from "@/features/question-bank";

import SubjectHeader from "../components/subject-details/SubjectHeader";
import SubjectOverviewTab from "../components/subject-details/SubjectOverviewTab";
import SubjectModulesTab from "../components/subject-details/SubjectModulesTab";
import EditSubjectModal from "../components/subject-details/EditSubjectModal";
import {
  AddModuleModal,
  EditModuleModal,
  DeleteModuleModal,
} from "../components/subject-details/ModuleModals";

export default function SubjectDetailsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { auth } = useAuth();

  const currentUserRole =
    (auth as any)?.data?.user?.role || (auth as any)?.user?.role || (auth as any)?.role;
  const canManageSubject =
    !currentUserRole ||
    currentUserRole === "SUPERADMIN" ||
    currentUserRole === "DEAN" ||
    currentUserRole === "TEAMLEAD";
  const canManageModules =
    canManageSubject || currentUserRole === "TEACHER";

  const tabParam = searchParams.get("tab");
  const activeTab: "overview" | "modules" = tabParam === "modules" ? "modules" : "overview";

  // Category Hooks
  const { data: category, isLoading: isCategoryLoading } = useCategoryDetail(categoryId);
  const updateCategoryMutation = useUpdateCategory();

  // Topics Hook
  const { data: topics = [] } = useTopics(categoryId || null);

  // Learning Modules Hooks
  const { data: modules = [], isLoading: isModulesLoading } =
    useLearningModules(categoryId || null);
  const createModuleMutation = useCreateLearningModule(categoryId || null);
  const updateModuleMutation = useUpdateLearningModule(categoryId || null);
  const deleteModuleMutation = useDeleteLearningModule(categoryId || null);

  const handleTabChange = (tab: "overview" | "modules" | "topics") => {
    if (tab === "topics") {
      navigate(`/subject-management/${categoryId}/topics`);
      return;
    }
    if (tab === activeTab) return;
    if (tab === "modules") {
      setSearchParams({ tab: "modules" });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("tab");
      setSearchParams(newParams);
    }
  };

  // Module Modal States
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<LearningModule | null>(null);
  const [deletingModule, setDeletingModule] = useState<LearningModule | null>(null);

  // Subject Edit Modal State
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editSubjectIcon, setEditSubjectIcon] = useState("BookOpen");

  const totalQuestions =
    typeof category?._count?.questions === "number"
      ? category._count.questions
      : Array.isArray(category?.questions)
      ? category.questions.length
      : 0;

  const handleOpenEditSubject = () => {
    if (!category) return;
    setEditSubjectName(category.name);
    setEditSubjectIcon(category.icon || "BookOpen");
    setIsEditSubjectOpen(true);
  };

  const handleUpdateSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !editSubjectName.trim()) return;

    updateCategoryMutation.mutate(
      {
        categoryId,
        name: editSubjectName.trim(),
        icon: editSubjectIcon,
      },
      {
        onSuccess: () => setIsEditSubjectOpen(false),
      }
    );
  };

  const handleCreateModuleSubmit = async (data: {
    title: string;
    description?: string;
    fileUrls?: string[];
  }) => {
    await createModuleMutation.mutateAsync({
      title: data.title,
      description: data.description,
      fileUrls: data.fileUrls,
      order: modules.length + 1,
    });
  };

  const handleUpdateModuleSubmit = async (
    moduleId: string,
    data: {
      title: string;
      description?: string;
      fileUrls?: string[];
    }
  ) => {
    await updateModuleMutation.mutateAsync({
      moduleId,
      data,
    });
  };

  const handleDeleteModuleConfirm = () => {
    if (!deletingModule) return;
    deleteModuleMutation.mutate(deletingModule.id, {
      onSuccess: () => setDeletingModule(null),
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full max-w-5xl mx-auto min-h-full font-sans bg-background text-foreground animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb Bar */}
      <SubjectHeader
        category={category}
        categoryId={categoryId}
        isCategoryLoading={isCategoryLoading}
        canManage={canManageSubject}
        activeTab={activeTab}
        modulesCount={modules.length}
        topicsCount={topics.length}
        onTabChange={handleTabChange}
        onOpenEditSubject={handleOpenEditSubject}
        onBackNav={() =>
          window.history.length > 1
            ? navigate(-1)
            : navigate("/subject-management")
        }
      />

      {/* Main Content Area */}
      {isCategoryLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : activeTab === "overview" ? (
        <SubjectOverviewTab
          category={category}
          totalQuestions={totalQuestions}
          topicsCount={topics.length}
          modulesCount={modules.length}
          formatDate={formatDate}
          onNavigateQuestionBank={() => navigate("/question-bank")}
          onNavigateTopics={() => navigate(`/subject-management/${categoryId}/topics`)}
          onNavigateModulesTab={() => handleTabChange("modules")}
        />
      ) : (
        <SubjectModulesTab
          category={category}
          modules={modules}
          isModulesLoading={isModulesLoading}
          canManage={canManageModules}
          onAddModule={() => setIsAddModuleOpen(true)}
          onEditModule={setEditingModule}
          onDeleteModule={setDeletingModule}
        />
      )}

      {/* Edit Subject Modal */}
      {canManageSubject && (
        <EditSubjectModal
          isOpen={isEditSubjectOpen}
          onOpenChange={setIsEditSubjectOpen}
          subjectName={editSubjectName}
          onSubjectNameChange={setEditSubjectName}
          subjectIcon={editSubjectIcon}
          onSubjectIconChange={setEditSubjectIcon}
          isSubmitting={updateCategoryMutation.isPending}
          onSubmit={handleUpdateSubjectSubmit}
        />
      )}

      {/* Add Module Modal */}
      {canManageModules && (
        <AddModuleModal
          isOpen={isAddModuleOpen}
          onOpenChange={setIsAddModuleOpen}
          categoryName={category?.name}
          isPending={createModuleMutation.isPending}
          onSubmitModule={handleCreateModuleSubmit}
        />
      )}

      {/* Edit Module Modal */}
      {canManageModules && (
        <EditModuleModal
          editingModule={editingModule}
          onOpenChange={(open) => !open && setEditingModule(null)}
          isPending={updateModuleMutation.isPending}
          onUpdateModule={handleUpdateModuleSubmit}
        />
      )}

      {/* Delete Module Dialog */}
      {canManageModules && (
        <DeleteModuleModal
          deletingModule={deletingModule}
          onOpenChange={(open: boolean) => !open && setDeletingModule(null)}
          isPending={deleteModuleMutation.isPending}
          onConfirm={handleDeleteModuleConfirm}
        />
      )}
    </div>
  );
}
