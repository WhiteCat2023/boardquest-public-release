import SettingsHeader from "./components/SettingsHeader";
import ThemeSettingsCard from "./components/ThemeSettingsCard";
import NotificationSettingsCard from "./components/NotificationSettingsCard";
import DisplaySettingsCard from "./components/DisplaySettingsCard";

function Settings() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full font-sans bg-background text-foreground">
      {/* Header Summary Banner */}
      <SettingsHeader />

      {/* Settings Cards Section */}
      <div className="flex flex-col gap-6 w-full min-w-0">
        <ThemeSettingsCard />
        <NotificationSettingsCard />
        <DisplaySettingsCard />
      </div>
    </div>
  );
}

export default Settings;