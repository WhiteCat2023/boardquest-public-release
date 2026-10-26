import type { ThemePreset, SystemBrandingSettings } from "../types/types";
import defaultLogo from "@/assets/baordquest-no-title.png";
import swuLogo from "@/assets/swu-logo.png";
import medtechLogo from "@/assets/medtech_logo.jpg";
import fullLogo from "@/assets/boardquest.png";

export const SYSTEM_SETTINGS_STORAGE_KEY = "boardquest_system_settings";
export const SYSTEM_SETTINGS_EVENT = "boardquest_system_settings_updated";

export const PRESET_LOGOS = [
  {
    id: "default-shield",
    name: "BoardQuest Shield",
    description: "Original shield emblem logo",
    url: defaultLogo,
  },
  {
    id: "swu-seal",
    name: "SWU PHINMA Seal",
    description: "Official institutional university seal",
    url: swuLogo,
  },
  {
    id: "medtech-insignia",
    name: "MedTech Insignia",
    description: "College of Medical Technology symbol",
    url: medtechLogo,
  },
  {
    id: "boardquest-full",
    name: "Full Brand Logo",
    description: "BoardQuest shield with typography",
    url: fullLogo,
  },
];

export const ADMIN_THEME_PRESETS: ThemePreset[] = [
  {
    id: "maroon-heritage",
    name: "Maroon Heritage",
    description: "SWU PHINMA signature maroon identity.",
    primaryOklch: "oklch(0.425 0.215 25)",
    primaryForegroundOklch: "oklch(0.985 0 0)",
    ringOklch: "oklch(0.425 0.215 25)",
    sidebarPrimaryOklch: "oklch(0.425 0.215 25)",
    accentOklch: "oklch(0.96 0.01 25)",
    accentForegroundOklch: "oklch(0.425 0.215 25)",
    previewBg: "#800000",
    tag: "Default Admin",
  },
  {
    id: "emerald-clinical",
    name: "Royal Emerald",
    description: "Healthcare & pharmacy clinical green.",
    primaryOklch: "oklch(0.45 0.16 150)",
    primaryForegroundOklch: "oklch(0.985 0 0)",
    ringOklch: "oklch(0.45 0.16 150)",
    sidebarPrimaryOklch: "oklch(0.45 0.16 150)",
    accentOklch: "oklch(0.96 0.02 150)",
    accentForegroundOklch: "oklch(0.45 0.16 150)",
    previewBg: "#059669",
  },
  {
    id: "deep-indigo",
    name: "Academic Indigo",
    description: "Prestige collegiate navy and deep indigo.",
    primaryOklch: "oklch(0.43 0.21 265)",
    primaryForegroundOklch: "oklch(0.985 0 0)",
    ringOklch: "oklch(0.43 0.21 265)",
    sidebarPrimaryOklch: "oklch(0.43 0.21 265)",
    accentOklch: "oklch(0.96 0.02 265)",
    accentForegroundOklch: "oklch(0.43 0.21 265)",
    previewBg: "#4338ca",
  },
  {
    id: "crimson-ruby",
    name: "Crimson Scarlet",
    description: "Vibrant high-energy academic ruby red.",
    primaryOklch: "oklch(0.48 0.23 15)",
    primaryForegroundOklch: "oklch(0.985 0 0)",
    ringOklch: "oklch(0.48 0.23 15)",
    sidebarPrimaryOklch: "oklch(0.48 0.23 15)",
    accentOklch: "oklch(0.96 0.02 15)",
    accentForegroundOklch: "oklch(0.48 0.23 15)",
    previewBg: "#dc2626",
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    description: "Modern calm cyan-teal medical laboratory aesthetic.",
    primaryOklch: "oklch(0.45 0.15 195)",
    primaryForegroundOklch: "oklch(0.985 0 0)",
    ringOklch: "oklch(0.45 0.15 195)",
    sidebarPrimaryOklch: "oklch(0.45 0.15 195)",
    accentOklch: "oklch(0.96 0.02 195)",
    accentForegroundOklch: "oklch(0.45 0.15 195)",
    previewBg: "#0d9488",
  },
  {
    id: "amber-sunset",
    name: "Amber Gold",
    description: "Warm executive amber and honey gold tones.",
    primaryOklch: "oklch(0.52 0.17 65)",
    primaryForegroundOklch: "oklch(0.985 0 0)",
    ringOklch: "oklch(0.52 0.17 65)",
    sidebarPrimaryOklch: "oklch(0.52 0.17 65)",
    accentOklch: "oklch(0.96 0.03 65)",
    accentForegroundOklch: "oklch(0.52 0.17 65)",
    previewBg: "#d97706",
  },
  {
    id: "monochrome-zinc",
    name: "Modern Monochrome",
    description: "Minimalist zinc & obsidian clean aesthetics.",
    primaryOklch: "oklch(0.205 0 0)",
    primaryForegroundOklch: "oklch(0.985 0 0)",
    ringOklch: "oklch(0.708 0 0)",
    sidebarPrimaryOklch: "oklch(0.205 0 0)",
    accentOklch: "oklch(0.97 0 0)",
    accentForegroundOklch: "oklch(0.205 0 0)",
    previewBg: "#18181b",
  },
];

export const REVIEW_CENTER_THEME_PRESETS: ThemePreset[] = [
  {
    id: "monochrome-zinc",
    name: "Modern Monochrome",
    description: "Clean minimalist dark zinc and white typography.",
    primaryOklch: "oklch(0.205 0 0)",
    primaryForegroundOklch: "oklch(0.985 0 0)",
    ringOklch: "oklch(0.708 0 0)",
    sidebarPrimaryOklch: "oklch(0.205 0 0)",
    accentOklch: "oklch(0.97 0 0)",
    accentForegroundOklch: "oklch(0.205 0 0)",
    previewBg: "#18181b",
    tag: "Default Review",
  },
  {
    id: "maroon-heritage",
    name: "Maroon Heritage",
    description: "Match the main admin university maroon branding.",
    primaryOklch: "oklch(0.425 0.215 25)",
    primaryForegroundOklch: "oklch(0.985 0 0)",
    ringOklch: "oklch(0.425 0.215 25)",
    sidebarPrimaryOklch: "oklch(0.425 0.215 25)",
    accentOklch: "oklch(0.96 0.01 25)",
    accentForegroundOklch: "oklch(0.425 0.215 25)",
    previewBg: "#800000",
  },
  {
    id: "ocean-teal",
    name: "Clinical Teal",
    description: "Calm diagnostic teal for student focus and clarity.",
    primaryOklch: "oklch(0.45 0.15 195)",
    primaryForegroundOklch: "oklch(0.985 0 0)",
    ringOklch: "oklch(0.45 0.15 195)",
    sidebarPrimaryOklch: "oklch(0.45 0.15 195)",
    accentOklch: "oklch(0.96 0.02 195)",
    accentForegroundOklch: "oklch(0.45 0.15 195)",
    previewBg: "#0d9488",
  },
  {
    id: "deep-indigo",
    name: "Study Indigo",
    description: "Deep study hall indigo for focus and confidence.",
    primaryOklch: "oklch(0.43 0.21 265)",
    primaryForegroundOklch: "oklch(0.985 0 0)",
    ringOklch: "oklch(0.43 0.21 265)",
    sidebarPrimaryOklch: "oklch(0.43 0.21 265)",
    accentOklch: "oklch(0.96 0.02 265)",
    accentForegroundOklch: "oklch(0.43 0.21 265)",
    previewBg: "#4338ca",
  },
  {
    id: "emerald-clinical",
    name: "Health Emerald",
    description: "Vibrant medical review green.",
    primaryOklch: "oklch(0.45 0.16 150)",
    primaryForegroundOklch: "oklch(0.985 0 0)",
    ringOklch: "oklch(0.45 0.16 150)",
    sidebarPrimaryOklch: "oklch(0.45 0.16 150)",
    accentOklch: "oklch(0.96 0.02 150)",
    accentForegroundOklch: "oklch(0.45 0.16 150)",
    previewBg: "#059669",
  },
];

export const DEFAULT_SYSTEM_SETTINGS: SystemBrandingSettings = {
  systemName: "BoardQuest",
  institutionSubtitle: "SWU PHINMA",
  logoUrl: defaultLogo,
  adminThemeId: "maroon-heritage",
  reviewCenterThemeId: "monochrome-zinc",
};

export function loadStoredSystemSettings(): SystemBrandingSettings {
  if (typeof window === "undefined") return DEFAULT_SYSTEM_SETTINGS;
  try {
    const raw = localStorage.getItem(SYSTEM_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SYSTEM_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SYSTEM_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SYSTEM_SETTINGS;
  }
}

export function saveStoredSystemSettings(settings: SystemBrandingSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SYSTEM_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent(SYSTEM_SETTINGS_EVENT, { detail: settings })
    );
  } catch (err) {
    console.error("Failed to save system settings to localStorage", err);
  }
}

export const QUICK_COLOR_SWATCHES = [
  { label: "Maroon", hex: "#800000" },
  { label: "Emerald", hex: "#059669" },
  { label: "Indigo", hex: "#4338ca" },
  { label: "Sapphire", hex: "#2563eb" },
  { label: "Crimson", hex: "#dc2626" },
  { label: "Teal", hex: "#0d9488" },
  { label: "Amber", hex: "#d97706" },
  { label: "Purple", hex: "#7c3aed" },
  { label: "Rose", hex: "#e11d48" },
  { label: "Slate", hex: "#334155" },
];

export function isLightColor(hex: string): boolean {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (cleanHex.length !== 6) return false;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 170;
}

export function applyThemeToDOM(preset: ThemePreset): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--primary", preset.primaryOklch);
  root.style.setProperty("--primary-foreground", preset.primaryForegroundOklch);
  root.style.setProperty("--ring", preset.ringOklch);
  root.style.setProperty("--chart-1", preset.primaryOklch);
  root.style.setProperty("--sidebar-primary", preset.sidebarPrimaryOklch);
  root.style.setProperty("--sidebar-primary-foreground", preset.primaryForegroundOklch);

  // Clear inline accent styles so CSS color-mix dynamically adapts for both light and dark mode
  root.style.removeProperty("--accent");
  root.style.removeProperty("--sidebar-accent");
  root.style.removeProperty("--accent-foreground");
  root.style.removeProperty("--sidebar-accent-foreground");
}

export function applyCustomColorToDOM(hex: string): void {
  if (typeof document === "undefined" || !hex) return;
  const root = document.documentElement;
  const fg = isLightColor(hex) ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)";
  root.style.setProperty("--primary", hex);
  root.style.setProperty("--primary-foreground", fg);
  root.style.setProperty("--ring", hex);
  root.style.setProperty("--chart-1", hex);
  root.style.setProperty("--sidebar-primary", hex);
  root.style.setProperty("--sidebar-primary-foreground", fg);

  // Clear inline accent styles so CSS color-mix uses custom --primary automatically
  root.style.removeProperty("--accent");
  root.style.removeProperty("--sidebar-accent");
  root.style.removeProperty("--accent-foreground");
  root.style.removeProperty("--sidebar-accent-foreground");
}

