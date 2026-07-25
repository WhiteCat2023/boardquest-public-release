import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Laptop,
  Check,
  Bell,
  Sliders,
  Sparkles,
  ShieldCheck,
  Globe,
  LayoutGrid
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function Settings() {
  const { theme, setTheme } = useTheme();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const [defaultPageSize, setDefaultPageSize] = useState("10");
  const [compactMode, setCompactMode] = useState(false);

  const themeOptions = [
    {
      id: "light",
      name: "Light Mode",
      description: "Clean, bright aesthetic tailored for day usage.",
      icon: Sun,
    },
    {
      id: "dark",
      name: "Dark Mode",
      description: "Sleek, low-light aesthetic tailored for night usage.",
      icon: Moon,
    },
    {
      id: "system",
      name: "System Default",
      description: "Automatically matches your operating system setting.",
      icon: Laptop,
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans">
      {/* Header Summary Banner */}
      <div className="flex flex-col gap-1.5 pb-2 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20">
            <Sliders size={22} className="stroke-[2.5]" />
          </div>
          System & Appearance Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Customize your application theme, notification preferences, and visual display defaults.
        </p>
      </div>

      {/* Card 1: Theme & Appearance Switcher */}
      <Card id="theme" className="bg-card border border-border rounded-3xl shadow-xs overflow-hidden scroll-mt-6">
        <CardHeader className="border-b border-border pb-4 pt-6 px-6 bg-card">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            Theme & Color Appearance
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select your preferred visual mode for BoardQuest.
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    toast.success(`Theme set to ${opt.name}`);
                  }}
                  className={`relative flex flex-col justify-between p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-primary ring-2 ring-primary/20 text-foreground shadow-xs"
                      : "bg-muted/50 border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        <Check size={12} /> Active
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground">{opt.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Notification & Alert Preferences */}
      <Card id="notifications" className="bg-card border border-border rounded-3xl shadow-xs overflow-hidden scroll-mt-6">
        <CardHeader className="border-b border-border pb-4 pt-6 px-6 bg-card">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            Notification Preferences
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure how and when you receive system alerts and security notifications.
          </p>
        </CardHeader>

        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-2xl">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <Bell size={15} className="text-primary" /> Email Notifications
              </span>
              <span className="text-xs text-muted-foreground">
                Receive email alerts for question approvals and system changes.
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => {
                setEmailNotifications(e.target.checked);
                toast.info(`Email notifications ${e.target.checked ? "enabled" : "disabled"}`);
              }}
              className="h-5 w-5 accent-[#A70202] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-2xl">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck size={15} className="text-primary" /> Security & Login Alerts
              </span>
              <span className="text-xs text-muted-foreground">
                Get notified whenever logins from new devices occur.
              </span>
            </div>
            <input
              type="checkbox"
              checked={securityAlerts}
              onChange={(e) => {
                setSecurityAlerts(e.target.checked);
                toast.info(`Security alerts ${e.target.checked ? "enabled" : "disabled"}`);
              }}
              className="h-5 w-5 accent-[#A70202] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-2xl">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe size={15} className="text-primary" /> Weekly Performance Digest
              </span>
              <span className="text-xs text-muted-foreground">
                Summary email of faculty and student review activity.
              </span>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => {
                setWeeklyDigest(e.target.checked);
                toast.info(`Weekly digest ${e.target.checked ? "enabled" : "disabled"}`);
              }}
              className="h-5 w-5 accent-[#A70202] rounded cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Display & Table Defaults */}
      <Card id="display" className="bg-card border border-border rounded-3xl shadow-xs overflow-hidden scroll-mt-6">
        <CardHeader className="border-b border-border pb-4 pt-6 px-6 bg-card">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <LayoutGrid size={18} className="text-primary" />
            Display & View Options
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure default table pagination and display density options.
          </p>
        </CardHeader>

        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 p-4 bg-muted/40 border border-border rounded-2xl">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Default Table Page Size
            </label>
            <select
              value={defaultPageSize}
              onChange={(e) => {
                setDefaultPageSize(e.target.value);
                toast.success(`Default page size set to ${e.target.value} rows`);
              }}
              className="h-10 px-3 bg-background border border-border rounded-xl text-xs font-semibold text-foreground focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
            >
              <option value="10">10 items per page</option>
              <option value="20">20 items per page</option>
              <option value="50">50 items per page</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 p-4 bg-muted/40 border border-border rounded-2xl">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Compact View Mode
            </label>
            <div className="flex items-center justify-between h-10">
              <span className="text-xs font-medium text-foreground">Enable compact row spacing</span>
              <input
                type="checkbox"
                checked={compactMode}
                onChange={(e) => {
                  setCompactMode(e.target.checked);
                  toast.info(`Compact mode ${e.target.checked ? "enabled" : "disabled"}`);
                }}
                className="h-5 w-5 accent-[#A70202] rounded cursor-pointer"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;