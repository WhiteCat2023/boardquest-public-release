import React from "react";
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
  Printer,
  ChevronDown,
  Loader2,
  Settings2,
  FileText,
  Sparkles,
  CheckCircle2,
  ListChecks,
  PenTool,
  ExternalLink,
} from "lucide-react";
import { useExportQuestionsToPdf } from "../../api/useExportQuestionsToPdf";

export interface ExportPdfButtonProps {
  currentCategory?: string;
  currentCategoryName?: string;
  totalApprovedCount?: number;
  className?: string;
}

export function ExportPdfButton({
  currentCategory,
  currentCategoryName = "All Subjects",
  totalApprovedCount,
  className = "",
}: ExportPdfButtonProps) {
  const navigate = useNavigate();
  const { isDirectExporting, exportAllApproved } = useExportQuestionsToPdf({
    currentCategory,
    currentCategoryName,
    totalApprovedCount,
  });

  const handleOpenExportPage = (params?: { category?: string; type?: string }) => {
    const query = new URLSearchParams();
    const cat = params?.category !== undefined ? params.category : currentCategory;
    if (cat && cat !== "ALL") {
      query.set("category", cat);
    }
    if (params?.type && params.type !== "ALL") {
      query.set("type", params.type);
    }
    const queryString = query.toString();
    navigate(`/question-bank/export-pdf${queryString ? `?${queryString}` : ""}`);
  };

  const handleQuickPrintAll = () => {
    exportAllApproved({
      category: undefined,
      categoryName: "All Subjects",
      mode: "comprehensive",
    });
  };

  const hasSpecificCategory = Boolean(currentCategory && currentCategory !== "ALL");

  return (
    <div className={`inline-flex items-center rounded-xl shadow-xs ${className}`}>
      {/* Main Action Button - Navigates to Dedicated Full Export Page */}
      <Button
        type="button"
        variant="outline"
        onClick={() => handleOpenExportPage()}
        disabled={isDirectExporting}
        className="h-9 px-3.5 text-xs font-semibold rounded-r-none border-r-0 border-border bg-card hover:bg-muted text-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5 transition-all"
        title="Open Full-Page PDF Export Studio"
      >
        <FileDown size={14} className="text-[#A70202]" />
        <span>Export to PDF</span>
      </Button>

      {/* Dropdown Menu for Direct Filter Routing or 1-Click Print */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={isDirectExporting}
            className="h-9 px-2 rounded-l-none border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-all"
            title="More PDF export options"
          >
            <ChevronDown size={13} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-xl font-sans text-xs">
          <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground">
            Export Page Presets
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => handleOpenExportPage()}
            className="gap-2 cursor-pointer py-2 font-medium"
          >
            <Settings2 size={14} className="text-[#A70202]" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Open Full Export Page</span>
              <span className="text-[10px] text-muted-foreground">
                All filters, custom layout & live vector preview
              </span>
            </div>
          </DropdownMenuItem>

          {hasSpecificCategory && (
            <DropdownMenuItem
              onClick={() => handleOpenExportPage({ category: currentCategory })}
              className="gap-2 cursor-pointer py-2 font-medium"
            >
              <FileText size={14} className="text-primary" />
              <div className="flex flex-col">
                <span className="font-semibold text-foreground truncate max-w-[170px]">
                  Export Subject: {currentCategoryName}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Pre-filtered to current subject
                </span>
              </div>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground">
            Filter by Question Type
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => handleOpenExportPage({ type: "MCQ" })}
            className="gap-2 cursor-pointer py-1.5 font-medium"
          >
            <ListChecks size={14} className="text-sky-600" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Multiple Choice Only</span>
              <span className="text-[10px] text-muted-foreground">
                Pre-filtered to MCQ questions
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleOpenExportPage({ type: "TRUE_FALSE" })}
            className="gap-2 cursor-pointer py-1.5 font-medium"
          >
            <CheckCircle2 size={14} className="text-amber-600" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">True or False Only</span>
              <span className="text-[10px] text-muted-foreground">
                Pre-filtered to binary True/False items
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleOpenExportPage({ type: "SHORT_ANSWER" })}
            className="gap-2 cursor-pointer py-1.5 font-medium"
          >
            <PenTool size={14} className="text-purple-600" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Short Answer Only</span>
              <span className="text-[10px] text-muted-foreground">
                Pre-filtered to short answer / identification
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleQuickPrintAll}
            disabled={isDirectExporting}
            className="gap-2 cursor-pointer py-2 font-medium"
          >
            {isDirectExporting ? (
              <Loader2 size={14} className="animate-spin text-[#A70202]" />
            ) : (
              <Printer size={14} className="text-muted-foreground" />
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Quick 1-Click Print All</span>
              <span className="text-[10px] text-muted-foreground">
                Instantly trigger print dialog for all approved items
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ExportPdfButton;
