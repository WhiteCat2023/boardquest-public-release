import { Sliders } from "lucide-react";

export default function SettingsHeader() {
  return (
    <div className="flex flex-col gap-1.5 pb-2 border-b border-border font-sans">
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
  );
}
