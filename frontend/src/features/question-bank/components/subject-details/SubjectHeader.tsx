import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, CheckCircle2, Layers, Pencil } from "lucide-react";
import { getCategoryIcon } from "@/features/question-bank/components/IconPicker";

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
  activeTab: "overview" | "modules";
  modulesCount: number;
  onTabChange: (tab: "overview" | "modules") => void;
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
  onTabChange,
  onOpenEditSubject,
  onBackNav,
}: SubjectHeaderProps) {
  return (
    <div className="flex flex-col gap-2.5 sticky top-0 bg-background/95 backdrop-blur-md pb-2.5 pt-1 -mt-1 z-10 border-b border-border/80">
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
            <p className="text-[11px] text-muted-foreground font-mono">
              ID: {categoryId || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {canManage && category && (
            <Button
              onClick={onOpenEditSubject}
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
              onClick={() => onTabChange("overview")}
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
              onClick={() => onTabChange("modules")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "modules"
                  ? "bg-card text-foreground shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers size={13} />
              Learning Modules ({modulesCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
