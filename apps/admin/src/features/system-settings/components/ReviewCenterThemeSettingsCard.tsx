import React, { useState, useRef } from "react";
import { Palette, Check, Lock, GraduationCap, Pipette } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSystemSettingsStore } from "../store/systemSettingsStore";
import { REVIEW_CENTER_THEME_PRESETS, QUICK_COLOR_SWATCHES } from "../utils/themeUtils";
import { showFeedback } from "@/components/modal";

export default function ReviewCenterThemeSettingsCard() {
  const { settings, setReviewCenterTheme, setReviewCenterCustomColor } = useSystemSettingsStore();
  const [customHex, setCustomHex] = useState(settings.reviewCenterCustomColor || "#18181b");
  const colorPickerRef = useRef<HTMLInputElement>(null);

  const isCustomSelected = settings.reviewCenterThemeId === "custom";

  const handleApplyCustom = (color: string) => {
    let clean = color.trim();
    if (!clean.startsWith("#")) clean = `#${clean}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean) || /^#[0-9A-Fa-f]{3}$/.test(clean)) {
      setCustomHex(clean);
      setReviewCenterCustomColor(clean);
      showFeedback.success(`Review Center custom color applied: ${clean}`);
    } else {
      showFeedback.error("Please enter a valid HEX color code (e.g. #18181b).");
    }
  };

  return (
    <Card id="review-center-theme" className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden scroll-mt-6 font-sans">
      <CardHeader className="border-b border-border/70 py-3.5 px-4 md:px-5 bg-card flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <GraduationCap size={16} className="text-primary" />
          <span>Review Center Portal Theme</span>
        </CardTitle>
        <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/60">
          <Lock size={10} className="text-muted-foreground/70" />
          <span>SuperAdmin & Dean Managed Only</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-5 space-y-5">
        {/* Policy notice banner */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/70 text-xs text-muted-foreground">
          <Lock size={14} className="text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Review Center partner staff and students have <strong>no access</strong> to system branding controls. Themes configured here synchronize to the Review Center web application automatically via shared system branding configuration.
          </p>
        </div>

        {/* ── Preset Themes Grid ── */}
        <div>
          <Label className="text-xs font-bold text-foreground block mb-2">
            Preset Palettes
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {REVIEW_CENTER_THEME_PRESETS.map((preset) => {
              const isSelected = settings.reviewCenterThemeId === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setReviewCenterTheme(preset.id);
                    showFeedback.success(`Review Center theme set to ${preset.name}`);
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
                        Review Portal
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

        {/* ── Custom Color Picker Section for Review Center ── */}
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
                    Custom Review Center Color Picker
                  </span>
                  {isCustomSelected && (
                    <Badge variant="outline" className="text-[9.5px] font-bold bg-primary/10 text-primary border-primary/20">
                      Active
                    </Badge>
                  )}
                </div>
                <span className="text-[10.5px] text-muted-foreground">
                  Pick a custom brand color for students and instructors in Review Center.
                </span>
              </div>
            </div>

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
                placeholder="#18181b"
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
              <span>Apply to Review Center</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
