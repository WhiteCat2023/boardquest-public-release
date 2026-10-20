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
  AlertTriangle,
  FileText,
  Users,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { fetchAllStudents } from "../../services/studentPdfExportService";
import { exportStudentsToExcel } from "../../services/studentExcelExportService";
import { showFeedback } from "@/components/modal";

export interface ExportStudentsPdfButtonProps {
  currentStanding?: string;
  currentPace?: string;
  currentEngagement?: string;
  className?: string;
}

export default function ExportStudentsPdfButton({
  currentStanding,
  currentPace,
  currentEngagement,
  className = "",
}: ExportStudentsPdfButtonProps) {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleOpenExportPage = (params?: {
    standing?: string;
    pace?: string;
    engagement?: string;
  }) => {
    const query = new URLSearchParams();
    const st = params?.standing !== undefined ? params.standing : currentStanding;
    if (st && st !== "ALL") {
      query.set("standing", st);
    }
    const pc = params?.pace !== undefined ? params.pace : currentPace;
    if (pc && pc !== "ALL") {
      query.set("pace", pc);
    }
    const eng = params?.engagement !== undefined ? params.engagement : currentEngagement;
    if (eng && eng !== "ALL") {
      query.set("engagement", eng);
    }

    const queryString = query.toString();
    navigate(`/student-management/export-pdf${queryString ? `?${queryString}` : ""}`);
  };

  const handleQuickExportExcel = async () => {
    setIsExportingExcel(true);
    const toastId = showFeedback.loading("Preparing students Excel spreadsheet...");
    try {
      const data = await fetchAllStudents(axiosPrivate);
      exportStudentsToExcel(data, {
        mode: "comprehensive",
        includeContactInfo: true,
        includeMetrics: true,
      });
      showFeedback.success(`Exported ${data.length} students to Excel (.xlsx)`, { id: toastId });
    } catch (err: any) {
      showFeedback.error(err?.message || "Failed to export students to Excel", { id: toastId });
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
        className="h-9 px-3.5 text-xs font-semibold rounded-r-none border-r-0 border-border bg-card hover:bg-muted text-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5 transition-all"
        title="Open Full-Page Student Roster Export Studio"
      >
        <FileDown size={14} className="text-[#A70202]" />
        <span>Export Roster</span>
      </Button>

      {/* Dropdown Menu for Direct Filter Routing Presets & Excel Export */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-9 px-2 rounded-l-none border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-all"
            title="More export options"
          >
            <ChevronDown size={13} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-xl font-sans text-xs">
          <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground">
            Student Export Presets
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleOpenExportPage()}
            className="cursor-pointer gap-2 py-2 text-xs"
          >
            <Users size={14} className="text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">All Enrolled Students</span>
              <span className="text-[10px] text-muted-foreground">
                Complete directory and performance records
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleOpenExportPage({ standing: "FAILING" })}
            className="cursor-pointer gap-2 py-2 text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-500/10"
          >
            <AlertTriangle size={14} className="text-rose-600 shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold">At-Risk & Failing Students</span>
              <span className="text-[10px] text-muted-foreground">
                Immediate academic intervention roster
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleOpenExportPage({ pace: "BEHIND" })}
            className="cursor-pointer gap-2 py-2 text-xs"
          >
            <FileText size={14} className="text-amber-600 shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Behind Schedule Roster</span>
              <span className="text-[10px] text-muted-foreground">
                Students with active calendar pacing lag
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
                Directly download full cohort spreadsheet
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
