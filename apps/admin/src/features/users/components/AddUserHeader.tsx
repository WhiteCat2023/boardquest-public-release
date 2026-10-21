import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Shield, UserPlus, Users } from "lucide-react";
import { StandardNavTabs } from "@/components/custom/tabs";

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
  const navigate = useNavigate();
  const isExternal = accountCategory === "external";
  const isIndividual = activeTab === "individual";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/faculty-management");
    }
  };

  return (
    <div className="flex flex-col gap-3 sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-2 -mt-2 z-10 border-b border-border/80 w-full">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="min-w-0">
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
        <div className="shrink-0 sm:ml-auto">
          <StandardNavTabs
            variant="pills"
            tabs={[
              {
                id: "individual",
                label: "Individual",
                icon: isExternal ? Building2 : UserPlus,
              },
              { id: "bulk", label: "Bulk", icon: Users },
            ]}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
        </div>
      </div>

      {/* Top-Level Account Type Category Switcher */}
      <StandardNavTabs
        tabs={[
          { id: "internal", label: "Internal Account", icon: Shield },
          { id: "external", label: "External Account", icon: Building2 },
        ]}
        activeTab={accountCategory}
        onTabChange={onCategoryChange}
      />
    </div>
  );
}
