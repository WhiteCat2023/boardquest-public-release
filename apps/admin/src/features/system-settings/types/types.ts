export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  primaryOklch: string;
  primaryForegroundOklch: string;
  ringOklch: string;
  sidebarPrimaryOklch: string;
  accentOklch: string;
  accentForegroundOklch: string;
  previewBg: string;
  tag?: string;
}

export interface SystemBrandingSettings {
  systemName: string;
  institutionSubtitle: string;
  logoUrl: string;
  adminThemeId: string;
  adminCustomColor?: string;
  reviewCenterThemeId: string;
  reviewCenterCustomColor?: string;
  lastUpdated?: string;
  updatedBy?: string;
}
