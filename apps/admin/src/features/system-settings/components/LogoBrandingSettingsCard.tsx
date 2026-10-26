import React, { useRef } from "react";
import { Image, Upload, Check, RefreshCw, Sparkles, Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSystemSettingsStore } from "../store/systemSettingsStore";
import { PRESET_LOGOS } from "../utils/themeUtils";
import { showFeedback } from "@/components/modal";

export default function LogoBrandingSettingsCard() {
  const { settings, setLogoUrl, setSystemName, setInstitutionSubtitle } = useSystemSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showFeedback.error("Please upload an image file (PNG, JPG, SVG).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showFeedback.error("Logo file size must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoUrl(result);
        showFeedback.success("Custom logo uploaded and applied to sidebar!");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card id="branding" className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden scroll-mt-6 font-sans">
      <CardHeader className="border-b border-border/70 py-3.5 px-4 md:px-5 bg-card flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <Image size={16} className="text-primary" />
          <span>System Logo & Brand Identity</span>
        </CardTitle>
        <Badge variant="outline" className="text-[10.5px] font-semibold text-muted-foreground">
          Live Sidebar Sync
        </Badge>
      </CardHeader>

      <CardContent className="p-4 md:p-5 space-y-5">
        {/* Live Logo Preview Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border border-border/70">
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-card border border-border shadow-2xs text-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Current Active Logo
            </span>
            <div className="size-16 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-center p-2 mb-2 overflow-hidden">
              <img
                src={settings.logoUrl}
                alt="Active Logo"
                className="size-full object-contain"
              />
            </div>
            <span className="text-xs font-bold text-foreground truncate max-w-[150px]">
              {settings.systemName || "BoardQuest"}
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
              {settings.institutionSubtitle || "SWU PHINMA"}
            </span>
          </div>

          {/* Sidebar Header Simulation */}
          <div className="md:col-span-2 flex flex-col justify-center p-4 rounded-xl bg-sidebar border border-sidebar-border shadow-2xs">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Sidebar Dynamic Header Preview
            </span>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-card/60 border border-border/60 max-w-sm">
              <img
                src={settings.logoUrl}
                alt="Logo Preview"
                className="size-8 object-contain shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-foreground leading-tight truncate">
                  {settings.systemName || "BoardQuest"}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground leading-tight truncate">
                  {settings.institutionSubtitle || "Super Admin Portal"}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              Updating this logo dynamically changes the sidebar header across all portal layouts without requiring code redeployment.
            </p>
          </div>
        </div>

        {/* Preset Institutional Logos */}
        <div>
          <Label className="text-xs font-bold text-foreground block mb-2">
            Select Preset Logo
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_LOGOS.map((preset) => {
              const isSelected = settings.logoUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setLogoUrl(preset.url);
                    showFeedback.success(`Applied ${preset.name}`);
                  }}
                  className={`relative flex flex-col items-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-primary ring-1 ring-primary/20 shadow-2xs"
                      : "bg-card border-border hover:bg-muted/40 hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="size-12 rounded-lg bg-muted/40 border border-border/80 flex items-center justify-center p-1.5 mb-2 overflow-hidden">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="size-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground truncate w-full">
                    {preset.name}
                  </span>
                  <span className="text-[9.5px] text-muted-foreground truncate w-full mt-0.5">
                    {preset.description}
                  </span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check size={10} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Logo Upload & Text Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/60">
          <div>
            <Label htmlFor="custom-logo" className="text-xs font-bold text-foreground block mb-1.5">
              Upload Custom Logo
            </Label>
            <input
              ref={fileInputRef}
              id="custom-logo"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-xs h-9 gap-2 cursor-pointer border-dashed border-border hover:border-primary/50"
            >
              <Upload size={13} className="text-primary" />
              <span>Upload Image File</span>
            </Button>
            <span className="text-[10px] text-muted-foreground block mt-1">
              Supports PNG, JPG, or SVG (max 2MB)
            </span>
          </div>

          <div>
            <Label htmlFor="system-name" className="text-xs font-bold text-foreground block mb-1.5">
              Platform Name
            </Label>
            <Input
              id="system-name"
              type="text"
              value={settings.systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder="e.g. BoardQuest"
              className="text-xs h-9"
            />
          </div>

          <div>
            <Label htmlFor="institution-sub" className="text-xs font-bold text-foreground block mb-1.5">
              Institution Subtitle
            </Label>
            <Input
              id="institution-sub"
              type="text"
              value={settings.institutionSubtitle}
              onChange={(e) => setInstitutionSubtitle(e.target.value)}
              placeholder="e.g. SWU PHINMA"
              className="text-xs h-9"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
