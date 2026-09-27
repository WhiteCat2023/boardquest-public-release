import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Users } from "lucide-react";

interface EnrollStudentHeaderProps {
  activeTab: "individual" | "bulk";
  onTabChange: (tab: "individual" | "bulk") => void;
}

export function EnrollStudentHeader({
  activeTab,
  onTabChange,
}: EnrollStudentHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-2 -mt-2 z-10 border-b border-border/80">
      <div className="flex items-center gap-2">
        <Link
          to="/student-management"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Directory
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
              {activeTab === "individual" ? (
                <UserPlus size={18} className="stroke-[2.5]" />
              ) : (
                <Users size={18} className="stroke-[2.5]" />
              )}
            </div>
            {activeTab === "individual" ? "Enroll New Student" : "Bulk Enroll Students"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeTab === "individual"
              ? "Register an individual student account for online practice exams and evaluation."
              : "Batch upload multiple student accounts via CSV spreadsheet."}
          </p>
        </div>

        {/* Segmented Pill Tabs: Add User(individual) & Add Users(bulk) */}
        <div className="flex items-center p-1 bg-muted/60 border border-border/80 rounded-xl w-fit shrink-0">
          <button
            type="button"
            onClick={() => onTabChange("individual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "individual"
                ? "bg-card text-foreground shadow-2xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus size={13} />
            Individual
          </button>

          <button
            type="button"
            onClick={() => onTabChange("bulk")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "bulk"
                ? "bg-card text-foreground shadow-2xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users size={13} />
            Bulk
          </button>
        </div>
      </div>
    </div>
  );
}
