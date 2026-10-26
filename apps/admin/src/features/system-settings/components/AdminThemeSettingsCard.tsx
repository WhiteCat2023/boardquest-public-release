import React, { useState, useRef } from "react";
import { Palette, Check, Sparkles, Pipette, SlidersHorizontal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSystemSettingsStore } from "../store/systemSettingsStore";
import { ADMIN_THEME_PRESETS, QUICK_COLOR_SWATCHES } from "../utils/themeUtils";
import { showFeedback } from "@/components/modal";

export default function AdminThemeSettingsCard() {
  const { settings, setAdminTheme, setAdminCustomColor } = useSystemSettingsStore();
  const [customHex, setCustomHex] = useState(settings.adminCustomColor || "#800000");
  const colorPickerRef = useRef<HTMLInputElement>(null);

  const isCustomSelected = settings.adminThemeId === "custom";

  const handleApplyCustom = (color: string) => {
    let clean = color.trim();
    if (!clean.startsWith("#")) clean = `#${clean}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean) || /^#[0-9A-Fa-f]{3}$/.test(clean)) {
      setCustomHex(clean);
      setAdminCustomColor(clean);
      showFeedback.success(`Custom color applied: ${clean}`);
    } else {
      showFeedback.error("Please enter a valid HEX color code (e.g. #800000).");
    }
  };

  return (
    <Card id="admin-theme" className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden scroll-mt-6 font-sans">
      <CardHeader className="border-b border-border/70 py-3.5 px-4 md:px-5 bg-card flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <Palette size={16} className="text-primary" />
          <span>Admin Portal Color Theme</span>
        </CardTitle>
        <Badge variant="outline" className="text-[10.5px] font-semibold text-primary bg-primary/5 border-primary/20">
          Instant DOM Injection
        </Badge>
      </CardHeader>

      <CardContent className="p-4 md:p-5 space-y-5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Select from institutional theme presets or use the custom color picker below to match your university branding.
        </p>

        {/* ── Preset Themes Grid ── */}
        <div>
          <Label className="text-xs font-bold text-foreground block mb-2">
            Preset Palettes
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ADMIN_THEME_PRESETS.map((preset) => {
              const isSelected = settings.adminThemeId === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setAdminTheme(preset.id);
                    showFeedback.success(`Admin theme updated to ${preset.name}`);
                  }}
                  className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-primary ring-1 ring-primary/25 shadow-2xs"
                      : "bg-muted/30 border-border hover:bg-muted/50 hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 w-full">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-4 rounded-full shrink-0 shadow-2xs ring-1 ring-border/50"
                        style={{ backgroundColor: preset.previewBg }}
                      />
                      <span className="text-xs font-bold text-foreground truncate">
                        {preset.name}
                      </span>
                    </div>
                    {preset.tag && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground uppercase">
                        {preset.tag}
                      </span>
                    )}
                    {isSelected && (
                      <div className="size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                        <Check size={10} />
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-snug mb-3">
                    {preset.description}
                  </p>

                  <div className="mt-auto pt-2 border-t border-border/50 flex items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: preset.previewBg }}
                      >
                        Button
                      </span>
                      <span
                        className="inline-block text-[9.5px] font-semibold px-1.5 py-0.5 rounded border"
                        style={{
                          borderColor: `${preset.previewBg}40`,
                          color: preset.previewBg,
                        }}
                      >
                        Badge
                      </span>
                    </div>
                    <span className="text-[9.5px] font-mono text-muted-foreground/80">
                      {preset.previewBg}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Custom Color Picker Section ── */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isCustomSelected
            ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
            : "bg-muted/30 border-border/80"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Pipette size={16} className="text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    Custom Theme Color Picker
                  </span>
                  {isCustomSelected && (
                    <Badge variant="outline" className="text-[9.5px] font-bold bg-primary/10 text-primary border-primary/20">
                      Active
                    </Badge>
                  )}
                </div>
                <span className="text-[10.5px] text-muted-foreground">
                  Pick any custom HEX color code to apply across buttons, tabs, and accents.
                </span>
              </div>
            </div>

            {/* Hidden native color input with interactive swatch */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <input
                ref={colorPickerRef}
                type="color"
                value={customHex}
                onChange={(e) => {
                  setCustomHex(e.target.value);
                  handleApplyCustom(e.target.value);
                }}
                className="sr-only"
              />
              <button
                type="button"
                onClick={() => colorPickerRef.current?.click()}
                className="size-9 rounded-xl border border-border/80 shadow-2xs flex items-center justify-center p-1 cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: customHex }}
                title="Open system color picker"
              >
                <Pipette size={14} className="text-white drop-shadow-sm" />
              </button>
            </div>
          </div>

          {/* Quick Swatches Row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="text-[10px] font-bold text-muted-foreground mr-1">
              Quick Swatches:
            </span>
            {QUICK_COLOR_SWATCHES.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => handleApplyCustom(swatch.hex)}
                className={`size-6 rounded-lg transition-transform hover:scale-110 cursor-pointer shadow-2xs border ${
                  customHex.toLowerCase() === swatch.hex.toLowerCase() && isCustomSelected
                    ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-110"
                    : "border-border/60"
                }`}
                style={{ backgroundColor: swatch.hex }}
                title={`${swatch.label} (${swatch.hex})`}
              />
            ))}
          </div>

          {/* Input & Apply Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                HEX
              </span>
              <Input
                type="text"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                placeholder="#800000"
                className="text-xs font-mono h-9 pl-12 uppercase"
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => handleApplyCustom(customHex)}
              className="text-xs h-9 px-4 shrink-0 cursor-pointer gap-1.5 w-full sm:w-auto"
            >
              <Check size={12} />
              <span>Apply Custom Color</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
