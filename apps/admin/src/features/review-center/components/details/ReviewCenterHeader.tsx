import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Pencil,
  MapPin,
} from "lucide-react";
import type { ReviewCenterRepresentative } from "../../types/types";

interface ReviewCenterHeaderProps {
  reviewCenter: ReviewCenterRepresentative | null | undefined;
  isLoading: boolean;
  canManage: boolean;
  activeTab: "overview" | "students" | "schedules";
  studentsCount: number;
  schedulesCount: number;
  onTabChange: (tab: "overview" | "students" | "schedules") => void;
  onOpenEdit: () => void;
  onBackNav: () => void;
}

export default function ReviewCenterHeader({
  reviewCenter,
  isLoading,
  canManage,
  activeTab,
  studentsCount,
  schedulesCount,
  onTabChange,
  onOpenEdit,
  onBackNav,
}: ReviewCenterHeaderProps) {
  const getInitials = (name?: string) => {
    if (!name) return "RC";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-2.5 sticky top-0 bg-background/95 backdrop-blur-md pb-2.5 pt-1 -mt-1 z-10 border-b border-border/80 font-sans">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBackNav}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Review Centers
        </button>
      </div>

      {/* Main Title & Action / Tab Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar Icon */}
          <div className="size-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            {isLoading ? (
              <Skeleton className="size-full rounded-2xl" />
            ) : (
              getInitials(reviewCenter?.companyName || reviewCenter?.name)
            )}
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-foreground tracking-tight truncate">
                {isLoading ? (
                  <Skeleton className="h-6 w-48" />
                ) : (
                  reviewCenter?.companyName || "Review Center Profile"
                )}
              </h1>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10.5px] font-bold px-2 py-0 rounded-full shrink-0"
              >
                <CheckCircle2 size={11} className="mr-1 inline text-emerald-500" /> Verified Partner
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono text-[11px] font-medium bg-muted px-1.5 py-0.2 rounded border border-border">
                {reviewCenter?.employeeId || "RC-PARTNER"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-muted-foreground/70" />
                {reviewCenter?.location || "Philippines"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions & Segmented Tabs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {canManage && reviewCenter && (
            <Button
              onClick={onOpenEdit}
              variant="outline"
              className="rounded-xl border-border hover:bg-muted text-xs font-semibold px-3 h-8.5 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Pencil size={13} /> Edit Profile
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
              <Building2 size={13} />
              Overview
            </button>

            <button
              type="button"
              onClick={() => onTabChange("students")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "students"
                  ? "bg-card text-foreground shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap size={13} />
              Enrolled Students ({studentsCount})
            </button>

            <button
              type="button"
              onClick={() => onTabChange("schedules")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "schedules"
                  ? "bg-card text-foreground shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar size={13} />
              Schedules ({schedulesCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
