import { User, Lock, type LucideIcon } from "lucide-react";

export type ProfileTab = "details" | "security";

interface TabItem {
  id: ProfileTab;
  label: string;
  icon: LucideIcon;
}

const NAV_TABS: TabItem[] = [
  { id: "details", label: "Personal Details", icon: User },
  { id: "security", label: "Security & Password", icon: Lock },
];

interface ProfileNavTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export function ProfileNavTabs({ activeTab, onTabChange }: ProfileNavTabsProps) {
  return (
    <div className="border-b border-border flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none pt-1">
      {NAV_TABS.map((tab) => {
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
            <Icon size={14} className={isActive ? "text-primary" : "text-muted-foreground"} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
