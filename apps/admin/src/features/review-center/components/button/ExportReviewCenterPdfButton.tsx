import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileDown,
  ChevronDown,
  Users,
  Gamepad2,
  FileCheck,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { fetchReviewCenterCandidates } from "../../services/reviewCenterPdfExportService";
import { exportReviewCenterCandidatesToExcel } from "../../services/reviewCenterExcelExportService";
import { toast } from "sonner";

export interface ExportReviewCenterPdfButtonProps {
  reviewCenterId: string;
  currentSchoolYear?: string;
  currentGameStatus?: string;
  className?: string;
}

export default function ExportReviewCenterPdfButton({
  reviewCenterId,
  currentSchoolYear,
  currentGameStatus,
  className = "",
}: ExportReviewCenterPdfButtonProps) {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleOpenExportPage = (params?: {
    sy?: string;
    gameStatus?: string;
  }) => {
    const query = new URLSearchParams();
    const sy = params?.sy !== undefined ? params.sy : currentSchoolYear;
    if (sy && sy !== "ALL") {
      query.set("sy", sy);
    }
    const gs = params?.gameStatus !== undefined ? params.gameStatus : currentGameStatus;
    if (gs && gs !== "ALL") {
      query.set("gameStatus", gs);
    }

    const queryString = query.toString();
    navigate(
      `/review-center/${reviewCenterId}/export-pdf${
        queryString ? `?${queryString}` : ""
      }`
    );
  };

  const handleQuickExportExcel = async () => {
    setIsExportingExcel(true);
    const toastId = toast.loading("Preparing candidates Excel spreadsheet...");
    try {
      const { candidates } = await fetchReviewCenterCandidates(axiosPrivate, reviewCenterId, {
        schoolYear: currentSchoolYear && currentSchoolYear !== "ALL" ? currentSchoolYear : undefined,
      });
      exportReviewCenterCandidatesToExcel(candidates, {
        includeGameStats: true,
        includeSchoolYear: true,
      });
      toast.success(`Exported ${candidates.length} candidates to Excel (.xlsx)`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Failed to export candidates to Excel", { id: toastId });
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className={`inline-flex items-center rounded-xl shadow-xs ${className}`}>
      {/* Main Action Button - Navigates to Dedicated Full Export Page */}
      <Button
        type="button"
        variant="outline"
        onClick={() => handleOpenExportPage()}
        className="h-8.5 px-3.5 text-xs font-semibold rounded-r-none border-r-0 border-border bg-card hover:bg-muted text-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5 transition-all"
        title="Open Full-Page Review Center Export Studio"
      >
        <FileDown size={14} className="text-[#A70202]" />
        <span>Export Roster</span>
      </Button>

      {/* Dropdown Menu for Direct Filter Routing Presets */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-8.5 px-2 rounded-l-none border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-all"
            title="More export options"
          >
            <ChevronDown size={13} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-xl font-sans text-xs">
          <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground">
            Candidate Export Presets
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleOpenExportPage()}
            className="cursor-pointer gap-2 py-2 text-xs"
          >
            <Users size={14} className="text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">All Enrolled Candidates</span>
              <span className="text-[10px] text-muted-foreground">
                Complete cohort registry and game statistics
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleOpenExportPage({ gameStatus: "REGISTERED" })}
            className="cursor-pointer gap-2 py-2 text-xs text-amber-600 focus:text-amber-600 focus:bg-amber-500/10"
          >
            <Gamepad2 size={14} className="text-amber-600 shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold">Playing Game (Active Reviewees)</span>
              <span className="text-[10px] text-muted-foreground">
                Candidates with active BoardQuest accounts
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleOpenExportPage()}
            className="cursor-pointer gap-2 py-2 text-xs"
          >
            <FileCheck size={14} className="text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Official Attendance Roster</span>
              <span className="text-[10px] text-muted-foreground">
                Includes sign-off signatures for physical sessions
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleQuickExportExcel}
            disabled={isExportingExcel}
            className="cursor-pointer gap-2 py-2 text-xs text-emerald-700 dark:text-emerald-400 focus:text-emerald-700 focus:bg-emerald-500/10"
          >
            {isExportingExcel ? (
              <Loader2 size={14} className="animate-spin text-emerald-600 shrink-0" />
            ) : (
              <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="font-semibold">Quick Export to Excel (.xlsx)</span>
              <span className="text-[10px] text-muted-foreground">
                Directly download candidate roster spreadsheet
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
