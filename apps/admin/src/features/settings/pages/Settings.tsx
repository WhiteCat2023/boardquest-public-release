import SettingsHeader from "../components/SettingsHeader";
import ThemeSettingsCard from "../components/ThemeSettingsCard";
import NotificationSettingsCard from "../components/NotificationSettingsCard";

function Settings() {
  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full font-sans bg-background text-foreground animate-in fade-in duration-150">
      {/* Header Summary Banner */}
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