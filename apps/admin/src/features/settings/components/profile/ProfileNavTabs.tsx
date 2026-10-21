import { User, Lock } from "lucide-react";
import { StandardNavTabs, type NavTabItem } from "@/components/custom/tabs";

export type ProfileTab = "details" | "security";

const NAV_TABS: NavTabItem<ProfileTab>[] = [
  { id: "details", label: "Personal Details", icon: User },
  { id: "security", label: "Security & Password", icon: Lock },
];

interface ProfileNavTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export function ProfileNavTabs({ activeTab, onTabChange }: ProfileNavTabsProps) {
  return (
    <StandardNavTabs
      tabs={NAV_TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
}

