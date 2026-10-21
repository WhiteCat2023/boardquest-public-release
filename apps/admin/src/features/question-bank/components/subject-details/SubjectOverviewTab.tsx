import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Calendar,
  Clock,
  HelpCircle,
  Layers,
  ShieldCheck,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { AssignFacultyModal } from "./AssignFacultyModal";
import useRoleFlags from "@/hooks/useRoleFlags";
import { useTopics } from "../../api/useTopics";

interface SubjectOverviewTabProps {
  category: any;
  totalQuestions: number;
  modulesCount: number;
  topicsCount?: number;
  formatDate: (dateString?: string) => string;
  onNavigateQuestionBank: () => void;
  onNavigateTopics?: () => void;
  onNavigateModulesTab: () => void;
}

export default function SubjectOverviewTab({
  category,
  totalQuestions,
  modulesCount,
  topicsCount,
  formatDate,
  onNavigateQuestionBank,
  onNavigateTopics,
  onNavigateModulesTab,
}: SubjectOverviewTabProps) {
  const navigate = useNavigate();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const { isStaff: canAssignFaculty } = useRoleFlags();

  const categoryId = category?.id || category?._id;
  const { data: topics = [] } = useTopics(categoryId);
  const resolvedTopicsCount =
    typeof topicsCount === "number" ? topicsCount : topics.length;

  const handleNavigateTopics = () => {
    if (onNavigateTopics) {
      onNavigateTopics();
    } else if (categoryId) {
      navigate(`/subject-management/${categoryId}/topics`);
    }
  };

  const handlersList = Array.isArray(category?.handlers) && category.handlers.length > 0
    ? category.handlers.filter((h: any) => String(h.role || "").toUpperCase() === "TEACHER")
    : [];

  const handlersCount = handlersList.length > 0
    ? handlersList.length
    : Array.isArray(category?.handlerIds)
    ? category.handlerIds.length
    : 0;

  const currentHandlerIds = handlersList.length > 0
    ? handlersList.map((h: any) => h.id || h._id)
    : Array.isArray(category?.handlerIds)
    ? category.handlerIds
    : [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Evaluation Questions */}
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
              onClick={onNavigateQuestionBank}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-0.5"
            >
              Question Bank <ArrowRight size={11} />
            </button>
          </div>
          <div className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl shrink-0">
            <HelpCircle size={20} />
          </div>
        </div>

        {/* Topics */}
        <div className="p-4 bg-card border border-border/80 rounded-xl flex items-center justify-between shadow-2xs hover:border-emerald-500/40 transition-all text-left group">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground block truncate">
              Topics
            </span>
            <button
              type="button"
              onClick={handleNavigateTopics}
              className="text-2xl font-extrabold text-foreground tracking-tight hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer block text-left"
              title="View subject topics"
            >
              {resolvedTopicsCount}
            </button>
            <button
              type="button"
              onClick={handleNavigateTopics}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer pt-0.5"
            >
              Subject topics <ArrowRight size={11} />
            </button>
          </div>
          <div
            onClick={handleNavigateTopics}
            className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
            title="View subject topics"
          >
            <Bookmark size={20} />
          </div>
        </div>

        {/* Learning Modules */}
        <div className="p-4 bg-card border border-border/80 rounded-xl flex items-center justify-between shadow-2xs hover:border-blue-500/30 transition-all text-left">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground block truncate">
              Learning Modules
            </span>
            <p className="text-2xl font-extrabold text-foreground tracking-tight">
              {modulesCount}
            </p>
            <button
              type="button"
              onClick={onNavigateModulesTab}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-0.5"
            >
              Curriculum modules <ArrowRight size={11} />
            </button>
          </div>
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl shrink-0">
            <Layers size={20} />
          </div>
        </div>

        {/* Faculty Handlers */}
        <div className="p-4 bg-card border border-border/80 rounded-xl flex items-center justify-between shadow-2xs hover:border-purple-500/30 transition-all text-left">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground block truncate">
              Faculty Handlers
            </span>
            <p className="text-2xl font-extrabold text-foreground tracking-tight">
              {handlersCount}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-2.5 gap-2">
            <div>
              <h3 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" /> Assigned Teacher Handlers
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Deans and Team Leads automatically oversee and handle all subjects.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0">
                {handlersCount} Teacher(s)
              </Badge>
              {canAssignFaculty && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAssignModalOpen(true)}
                  className="h-7 text-xs font-semibold gap-1 px-2.5 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                >
                  <UserPlus size={13} /> Assign Teachers
                </Button>
              )}
            </div>
          </div>

          {handlersList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {handlersList.map((handler: any) => {
                const initials = handler.name
                  ? handler.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "US";
                return (
                  <div
                    key={handler.id || handler._id}
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
                          {handler.email || "Teacher"}
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
              <p className="text-xs font-bold text-foreground">No Teachers Assigned</p>
              <p className="text-[10px] text-muted-foreground max-w-xs">
                No specific teachers are explicitly assigned to this subject yet. Deans and Team Leads automatically oversee all subjects.
              </p>
              {canAssignFaculty && (
                <Button
                  size="sm"
                  onClick={() => setIsAssignModalOpen(true)}
                  className="mt-2 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
                >
                  <UserPlus size={13} /> Assign Teachers to Subject
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Assign Faculty Modal */}
      <AssignFacultyModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        categoryId={category?.id || category?._id || ""}
        categoryName={category?.name || "Subject Category"}
        currentHandlerIds={currentHandlerIds}
      />
    </div>
  );
}
