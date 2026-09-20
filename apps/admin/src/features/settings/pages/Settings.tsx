import SettingsHeader from "../components/SettingsHeader";
import ThemeSettingsCard from "../components/ThemeSettingsCard";
import NotificationSettingsCard from "../components/NotificationSettingsCard";

function Settings() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground animate-in fade-in duration-150">
      {/* Header */}
      <SettingsHeader />

      {/* Settings Cards Section */}
      <div className="flex flex-col gap-4 w-full min-w-0">
        <ThemeSettingsCard />
        <NotificationSettingsCard />
      </div>
    </div>
  );
}

export default Settings;