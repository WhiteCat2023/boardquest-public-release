import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Bookmark, CheckCircle2, Layers, Pencil } from "lucide-react";
import { getCategoryIcon } from "@/features/question-bank/components/IconPicker";
import { StandardNavTabs } from "@/components/custom/tabs";

function SubjectCategoryIcon({
  icon,
  name,
  size = 22,
  className = "",
}: {
  icon?: string | null;
  name?: string;
  size?: number;
  className?: string;
}) {
  const IconComp = getCategoryIcon(icon, name);
  return React.createElement(IconComp, { size, className });
}

interface SubjectHeaderProps {
  category: any;
  categoryId?: string;
  isCategoryLoading: boolean;
  canManage: boolean;
  activeTab: "overview" | "modules" | "topics";
  modulesCount: number;
  topicsCount?: number;
  onTabChange: (tab: "overview" | "modules" | "topics") => void;
  onOpenEditSubject: () => void;
  onBackNav: () => void;
}

export default function SubjectHeader({
  category,
  categoryId,
  isCategoryLoading,
  canManage,
  activeTab,
  modulesCount,
  topicsCount,
  onTabChange,
  onOpenEditSubject,
  onBackNav,
}: SubjectHeaderProps) {
  return (
    <div className="flex flex-col gap-2.5 sticky top-0 bg-background/95 backdrop-blur-md pb-0 pt-1 -mt-1 z-10 font-sans">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBackNav}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Subject Management
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0 shadow-2xs">
            <SubjectCategoryIcon
              icon={category?.icon}
              name={category?.name}
              size={22}
              className="stroke-[2.2]"
            />
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
          </div>
        </div>

        {canManage && category && (
          <div className="flex items-center gap-2.5">
            <Button
              onClick={onOpenEditSubject}
              variant="outline"
              className="rounded-lg border-border hover:bg-muted text-xs font-semibold px-3 h-8 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Pencil size={13} /> Edit Subject
            </Button>
          </div>
        )}
      </div>

      {/* Standard Horizontal Underline Navigation Tabs Bar */}
      <StandardNavTabs
        tabs={[
          { id: "overview", label: "Overview", icon: BookOpen },
          {
            id: "modules",
            label: "Learning Modules",
            icon: Layers,
            badgeCount: modulesCount,
          },
          {
            id: "topics",
            label: "Topics",
            icon: Bookmark,
            badgeCount: topicsCount,
          },
        ]}
        activeTab={activeTab}
        onTabChange={onTabChange}
        showScrollButtons="auto"
      />
    </div>
  );
}
