import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Shield, UserPlus, Users } from "lucide-react";

interface AddUserHeaderProps {
  accountCategory: "internal" | "external";
  activeTab: "individual" | "bulk";
  onCategoryChange: (cat: "internal" | "external") => void;
  onTabChange: (tab: "individual" | "bulk") => void;
}

export default function AddUserHeader({
  accountCategory,
  activeTab,
  onCategoryChange,
  onTabChange,
}: AddUserHeaderProps) {
  const isExternal = accountCategory === "external";
  const isIndividual = activeTab === "individual";

  return (
    <div className="flex flex-col gap-3 sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-2 -mt-2 z-10 border-b border-border/80">
      <div className="flex items-center gap-2">
        <Link
          to="/faculty-management"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Directory
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <div
              className={`p-1.5 rounded-xl border ${
                isExternal
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                  : "bg-primary/10 text-primary border-primary/20"
              }`}
            >
              {isExternal ? (
                isIndividual ? (
                  <Building2 size={18} className="stroke-[2.5]" />
                ) : (
                  <Users size={18} className="stroke-[2.5]" />
                )
              ) : isIndividual ? (
                <UserPlus size={18} className="stroke-[2.5]" />
              ) : (
                <Users size={18} className="stroke-[2.5]" />
              )}
            </div>
            {isExternal
              ? isIndividual
                ? "Register Review Center Account"
                : "Bulk Import Review Centers"
              : isIndividual
                ? "Add New User"
                : "Bulk Import Users"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isExternal
              ? isIndividual
                ? "Create a dedicated external partner account for review center representatives."
                : "Batch upload multiple review center partner accounts via CSV/Excel spreadsheet."
              : isIndividual
                ? "Register an individual user account for academic access and management."
                : "Batch upload multiple user accounts via CSV/Excel spreadsheet."}
          </p>
        </div>

        {/* Sub-tabs: Individual vs Bulk */}
        <div className="flex items-center p-1 bg-muted/60 border border-border/80 rounded-xl w-fit shrink-0">
          <button
            type="button"
            onClick={() => onTabChange("individual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isIndividual
                ? "bg-card text-foreground shadow-2xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isExternal ? (
              <Building2 size={13} />
            ) : (
              <UserPlus size={13} />
            )}
            Individual
          </button>

          <button
            type="button"
            onClick={() => onTabChange("bulk")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isIndividual
                ? "bg-card text-foreground shadow-2xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users size={13} />
            Bulk
          </button>
        </div>
      </div>

      {/* Top-Level Account Type Category Switcher */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1 mt-1">
        <button
          type="button"
          onClick={() => onCategoryChange("internal")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            !isExternal
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Shield size={14} />
          Internal Account
        </button>

        <button
          type="button"
          onClick={() => onCategoryChange("external")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            isExternal
              ? "bg-purple-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Building2 size={14} />
          External Account
        </button>
      </div>
    </div>
  );
}
