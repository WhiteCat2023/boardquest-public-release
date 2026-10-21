import { User, BookOpen, Activity } from "lucide-react";
import { StandardNavTabs, type NavTabItem } from "@/components/custom/tabs";

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
  const navTabs: NavTabItem<ViewUserTab>[] = [
    { id: "details", label: "Personal Details", icon: User },
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
      id: "activity",
      label: "Activity & Audit Logs",
      icon: Activity,
    },
  ];

  return (
    <StandardNavTabs
      tabs={navTabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
}

