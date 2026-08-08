import { Sliders } from "lucide-react";

export default function SettingsHeader() {
  return (
    <div className="flex items-center justify-between gap-4 pb-3 border-b border-border font-sans">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0">
          <Sliders size={18} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            System & Appearance Settings
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage application themes, notification preferences, and display density defaults.
          </p>
        </div>
      </div>
    </div>
  );
}
