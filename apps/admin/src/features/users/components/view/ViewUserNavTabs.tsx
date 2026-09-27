import { User, BookOpen, Activity } from "lucide-react";

export type ViewUserTab = "details" | "subjects" | "activity";

interface ViewUserNavTabsProps {
  activeTab: ViewUserTab;
  onTabChange: (tab: ViewUserTab) => void;
  isExternal?: boolean;
}

export default function ViewUserNavTabs({
  activeTab,
  onTabChange,
  isExternal = false,
}: ViewUserNavTabsProps) {
  const navTabs = [
    { id: "details" as const, label: "Personal Details", icon: User },
    ...(!isExternal
      ? [
          {
            id: "subjects" as const,
            label: "Handled Subjects",
            icon: BookOpen,
          },
        ]
      : []),
    {
      id: "activity" as const,
      label: "Activity & Audit Logs",
      icon: Activity,
    },
  ];

  return (
    <div className="border-b border-border flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none pt-1">
      {navTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap border-b-2 -mb-[1px] ${
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Icon
              size={14}
              className={isActive ? "text-primary" : "text-muted-foreground"}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
