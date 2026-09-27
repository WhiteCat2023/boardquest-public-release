import React from "react";
import { ArrowLeft, PlusCircle, FileSpreadsheet } from "lucide-react";

interface AddQuestionHeaderProps {
  activeTab: "individual" | "bulk";
  onTabChange: (tab: "individual" | "bulk") => void;
  isEditMode?: boolean;
  onBack: () => void;
}

export function AddQuestionHeader({
  activeTab,
  onTabChange,
  isEditMode = false,
  onBack,
}: AddQuestionHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sticky top-0 bg-background/95 backdrop-blur-md pb-2 pt-1 -mt-1 z-10 border-b border-border/80">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group cursor-pointer"
        >
          <ArrowLeft
            size={13}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Question Bank
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
              {activeTab === "individual" ? (
                <PlusCircle size={15} className="stroke-[2.5]" />
              ) : (
                <FileSpreadsheet size={15} className="stroke-[2.5]" />
              )}
            </div>
            {activeTab === "individual"
              ? isEditMode
                ? "Curriculum Revision Desk"
                : "Add New Question"
              : "Bulk Import Questions"}
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {activeTab === "individual"
              ? "Formulate evaluation questions linked to standard benchmarks"
              : "Batch upload multiple exam questions via CSV file spreadsheet."}
          </p>
        </div>

        {/* Segmented Pill Tabs */}
        {!isEditMode && (
          <div className="flex items-center p-0.5 bg-muted/60 border border-border/80 rounded-xl w-fit shrink-0">
            <button
              type="button"
              onClick={() => onTabChange("individual")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "individual"
                  ? "bg-card text-foreground shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PlusCircle size={13} />
              Individual
            </button>

            <button
              type="button"
              onClick={() => onTabChange("bulk")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "bulk"
                  ? "bg-card text-foreground shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileSpreadsheet size={13} />
              Bulk
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddQuestionHeader;
