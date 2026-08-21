import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/dateUtils";
import {
  useCategoryDetail,
  useUpdateCategory,
  useLearningModules,
  useCreateLearningModule,
  useUpdateLearningModule,
  useDeleteLearningModule,
  type LearningModule,
} from "@/features/question-bank";
import useAuth from "@/hooks/useAuth";

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
  const { auth } = useAuth();

  const currentUserRole =
    (auth as any)?.data?.user?.role || (auth as any)?.user?.role || (auth as any)?.role;
  const canManage =
    !currentUserRole ||
    currentUserRole === "SUPERADMIN" ||
    currentUserRole === "DEAN" ||
    currentUserRole === "TEAMLEAD";

  const [activeTab, setActiveTab] = useState<"overview" | "modules">("overview");

  // Category Hooks
  const { data: category, isLoading: isCategoryLoading } = useCategoryDetail(categoryId);
  const updateCategoryMutation = useUpdateCategory();

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
      <SubjectHeader
        category={category}
        categoryId={categoryId}
        isCategoryLoading={isCategoryLoading}
        canManage={canManage}
        activeTab={activeTab}
        modulesCount={modules.length}
        onTabChange={setActiveTab}
        onOpenEditSubject={handleOpenEditSubject}
        onBackNav={() => navigate("/subject-management")}
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
          modulesCount={modules.length}
          formatDate={formatDate}
          onNavigateQuestionBank={() => navigate("/question-bank")}
          onNavigateModulesTab={() => setActiveTab("modules")}
        />
      ) : (
        <SubjectModulesTab
          category={category}
          modules={modules}
          isModulesLoading={isModulesLoading}
          canManage={canManage}
          onAddModule={() => setIsAddModuleOpen(true)}
          onEditModule={handleOpenEditModule}
          onDeleteModule={setDeletingModule}
        />
      )}

      {/* Edit Subject Modal */}
      {canManage && (
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
      {canManage && (
        <AddModuleModal
          isOpen={isAddModuleOpen}
          onOpenChange={setIsAddModuleOpen}
          categoryName={category?.name}
          moduleTitle={moduleTitle}
          onModuleTitleChange={setModuleTitle}
          moduleDescription={moduleDescription}
          onModuleDescriptionChange={setModuleDescription}
          moduleFileUrl={moduleFileUrl}
          onModuleFileUrlChange={setModuleFileUrl}
          isPending={createModuleMutation.isPending}
          onSubmit={handleCreateModuleSubmit}
        />
      )}

      {/* Edit Module Modal */}
      {canManage && (
        <EditModuleModal
          editingModule={editingModule}
          onOpenChange={(open) => !open && setEditingModule(null)}
          editModuleTitle={editModuleTitle}
          onEditModuleTitleChange={setEditModuleTitle}
          editModuleDescription={editModuleDescription}
          onEditModuleDescriptionChange={setEditModuleDescription}
          editModuleFileUrl={editModuleFileUrl}
          onEditModuleFileUrlChange={setEditModuleFileUrl}
          isPending={updateModuleMutation.isPending}
          onSubmit={handleUpdateModuleSubmit}
        />
      )}

      {/* Delete Module Dialog */}
      {canManage && (
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
