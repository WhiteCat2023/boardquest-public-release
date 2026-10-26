import React, { useEffect } from "react";
import SystemSettingsHeader from "../components/SystemSettingsHeader";
import LogoBrandingSettingsCard from "../components/LogoBrandingSettingsCard";
import AdminThemeSettingsCard from "../components/AdminThemeSettingsCard";
import ReviewCenterThemeSettingsCard from "../components/ReviewCenterThemeSettingsCard";
import { useSystemSettingsStore } from "../store/systemSettingsStore";

export default function SystemSettingsPage() {
  const { initTheme, setShowSystemSettingsSubSidebar } = useSystemSettingsStore();

  useEffect(() => {
    initTheme();
    setShowSystemSettingsSubSidebar(true);
  }, [initTheme, setShowSystemSettingsSubSidebar]);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground animate-in fade-in duration-150">
      <SystemSettingsHeader />
      <div className="flex flex-col gap-4 w-full min-w-0">
        <LogoBrandingSettingsCard />
        <AdminThemeSettingsCard />
        <ReviewCenterThemeSettingsCard />
      </div>
    </div>
  );
}
