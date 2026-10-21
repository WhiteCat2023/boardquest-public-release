import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Users } from "lucide-react";
import { StandardNavTabs } from "@/components/custom/tabs";

interface EnrollStudentHeaderProps {
  activeTab: "individual" | "bulk";
  onTabChange: (tab: "individual" | "bulk") => void;
}

export function EnrollStudentHeader({
  activeTab,
  onTabChange,
}: EnrollStudentHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-2 -mt-2 z-10 border-b border-border/80 w-full">
      <div className="flex items-center gap-2">
        <Link
          to="/student-management"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Directory
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="min-w-0">
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
        <div className="shrink-0 sm:ml-auto">
          <StandardNavTabs
            variant="pills"
            tabs={[
              { id: "individual", label: "Individual", icon: UserPlus },
              { id: "bulk", label: "Bulk", icon: Users },
            ]}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
        </div>
      </div>
    </div>
  );
}
