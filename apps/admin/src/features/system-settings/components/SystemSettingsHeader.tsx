import { Sliders, ShieldCheck, RotateCcw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSystemSettingsStore } from "../store/systemSettingsStore";
import { showFeedback } from "@/components/modal";

export default function SystemSettingsHeader() {
  const { resetToDefaults, isSaving } = useSystemSettingsStore();

  const handleReset = async () => {
    await resetToDefaults();
    showFeedback.success("System branding and themes reset to defaults in database.");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 md:p-5 bg-card border border-border/80 rounded-2xl shadow-2xs font-sans">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
          <Sliders size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              System Settings & Institutional Branding
            </h1>
            <Badge variant="outline" className="text-[10px] font-bold bg-primary/5 text-primary border-primary/20">
              <ShieldCheck size={11} className="mr-1 inline" />
              SuperAdmin & Dean Exclusive
            </Badge>
            {isSaving ? (
              <Badge variant="outline" className="text-[10px] font-medium text-amber-600 border-amber-500/30 bg-amber-500/10 animate-pulse">
                Saving to Database...
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] font-medium text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                Database Synced
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure system logos, primary theme palettes, and institutional identity across Admin and Review Center portals.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSaving}
          onClick={handleReset}
          className="text-xs h-8 gap-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
        >
          <RotateCcw size={12} />
          <span>Reset Defaults</span>
        </Button>
      </div>
    </div>
  );
}
