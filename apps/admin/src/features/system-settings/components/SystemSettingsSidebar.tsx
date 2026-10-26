import React from "react";
import {
  ChevronLeft,
  Sliders,
  Image,
  Palette,
  GraduationCap,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSystemSettingsStore } from "../store/systemSettingsStore";
import {
  ADMIN_THEME_PRESETS,
  REVIEW_CENTER_THEME_PRESETS,
} from "../utils/themeUtils";
import { showFeedback } from "@/components/modal";

export interface SystemSettingsSidebarProps {
  onBack?: () => void;
  className?: string;
}

export function SystemSettingsSidebar({
  onBack,
  className = "",
}: SystemSettingsSidebarProps) {
  const { settings, activeSection, setActiveSection, resetToDefaults } =
    useSystemSettingsStore();

  const currentAdminPreset = ADMIN_THEME_PRESETS.find(
    (p) => p.id === settings.adminThemeId
  );
  const currentReviewPreset = REVIEW_CENTER_THEME_PRESETS.find(
    (p) => p.id === settings.reviewCenterThemeId
  );

  const adminColor =
    settings.adminThemeId === "custom"
      ? settings.adminCustomColor || "#800000"
      : currentAdminPreset?.previewBg || "#800000";

  const reviewColor =
    settings.reviewCenterThemeId === "custom"
      ? settings.reviewCenterCustomColor || "#18181b"
      : currentReviewPreset?.previewBg || "#18181b";

  const adminDesc =
    settings.adminThemeId === "custom"
      ? `Custom (${settings.adminCustomColor || "#800000"})`
      : currentAdminPreset?.name || "Maroon Heritage";

  const reviewDesc =
    settings.reviewCenterThemeId === "custom"
      ? `Custom (${settings.reviewCenterCustomColor || "#18181b"})`
      : currentReviewPreset?.name || "Modern Monochrome";

  const navSections = [
    {
      id: "branding",
      label: "Logo & Brand Identity",
      icon: Image,
      desc: "Institution logo & headers",
    },
    {
      id: "admin-theme",
      label: "Admin Portal Theme",
      icon: Palette,
      desc: adminDesc,
      color: adminColor,
    },
    {
      id: "review-center-theme",
      label: "Review Center Theme",
      icon: GraduationCap,
      desc: reviewDesc,
      color: reviewColor,
    },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={`w-full flex flex-col gap-2.5 font-sans ${className}`}>
      {/* Whole Row as Back Button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer text-left"
          title="Back to main menu"
        >
          <ChevronLeft size={14} className="shrink-0" />
          <span>Back to Main Menu</span>
        </button>
      )}

      {/* Header Info */}
      <div className="px-2 pt-1 pb-1">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sliders size={13} />
          </div>
          <span className="text-xs font-bold text-foreground">
            System Settings
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
          Institutional branding & styling controls
        </p>
      </div>

      {/* Quick Navigation Sections */}
      <div className="flex flex-col gap-1 px-1">
        <span className="text-[9.5px] font-bold text-muted-foreground/70 uppercase tracking-wider px-2 py-0.5">
          Sections
        </span>
        {navSections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.id)}
              className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-primary/10 text-primary font-bold border border-primary/20"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon size={14} className="shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs truncate">{sec.label}</span>
                  <span className="text-[9.5px] text-muted-foreground/80 truncate">
                    {sec.desc}
                  </span>
                </div>
              </div>
              {sec.color && (
                <span
                  className="size-2.5 rounded-full shrink-0 ring-1 ring-border"
                  style={{ backgroundColor: sec.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Live Branding Pill Card in Sidebar */}
      <div className="mt-2 p-2.5 rounded-xl bg-muted/40 border border-border/70 flex flex-col gap-2">
        <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider">
          Active Branding
        </span>
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-card border border-border/80 flex items-center justify-center p-1 shrink-0 overflow-hidden">
            <img
              src={settings.logoUrl}
              alt="Brand"
              className="size-full object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-bold text-foreground truncate">
              {settings.systemName || "BoardQuest"}
            </span>
            <span className="text-[9.5px] text-muted-foreground truncate">
              {settings.institutionSubtitle || "SWU PHINMA"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px]">
          <span className="text-muted-foreground">Themes</span>
          <div className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full ring-1 ring-border"
              title={`Admin: ${adminDesc}`}
              style={{ backgroundColor: adminColor }}
            />
            <span
              className="size-2.5 rounded-full ring-1 ring-border"
              title={`Review Center: ${reviewDesc}`}
              style={{ backgroundColor: reviewColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
