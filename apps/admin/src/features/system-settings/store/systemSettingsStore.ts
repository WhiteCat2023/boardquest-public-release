import { create } from "zustand";
import type { SystemBrandingSettings } from "../types/types";
import {
  DEFAULT_SYSTEM_SETTINGS,
  ADMIN_THEME_PRESETS,
  loadStoredSystemSettings,
  saveStoredSystemSettings,
  applyThemeToDOM,
  applyCustomColorToDOM,
  SYSTEM_SETTINGS_EVENT,
} from "../utils/themeUtils";
import {
  getSystemSettingsApi,
  updateSystemSettingsApi,
  resetSystemSettingsApi,
} from "../api/systemSettingsApi";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

interface SystemSettingsState {
  settings: SystemBrandingSettings;
  showSystemSettingsSubSidebar: boolean;
  activeSection: string;
  isLoading: boolean;
  isSaving: boolean;
  hasLoadedFromDb: boolean;

  // Actions
  setShowSystemSettingsSubSidebar: (show: boolean) => void;
  setActiveSection: (section: string) => void;
  fetchSettings: () => Promise<void>;
  setAdminTheme: (presetId: string) => Promise<void>;
  setAdminCustomColor: (hex: string) => Promise<void>;
  setReviewCenterTheme: (presetId: string) => Promise<void>;
  setReviewCenterCustomColor: (hex: string) => Promise<void>;
  setLogoUrl: (url: string) => Promise<void>;
  setSystemName: (name: string) => void;
  setInstitutionSubtitle: (sub: string) => void;
  saveSettings: (partial: Partial<SystemBrandingSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  initTheme: () => void;
}

export const useSystemSettingsStore = create<SystemSettingsState>((set, get) => {
  const initial = loadStoredSystemSettings();

  return {
    settings: initial,
    showSystemSettingsSubSidebar: true,
    activeSection: "branding",
    isLoading: false,
    isSaving: false,
    hasLoadedFromDb: false,

    setShowSystemSettingsSubSidebar: (show) => set({ showSystemSettingsSubSidebar: show }),
    setActiveSection: (section) => set({ activeSection: section }),

    fetchSettings: async () => {
      try {
        set({ isLoading: true });
        const remoteSettings = await getSystemSettingsApi();
        if (remoteSettings) {
          const merged: SystemBrandingSettings = {
            systemName: remoteSettings.systemName || DEFAULT_SYSTEM_SETTINGS.systemName,
            institutionSubtitle: remoteSettings.institutionSubtitle || DEFAULT_SYSTEM_SETTINGS.institutionSubtitle,
            logoUrl: remoteSettings.logoUrl || DEFAULT_SYSTEM_SETTINGS.logoUrl,
            adminThemeId: remoteSettings.adminThemeId || DEFAULT_SYSTEM_SETTINGS.adminThemeId,
            adminCustomColor: remoteSettings.adminCustomColor || undefined,
            reviewCenterThemeId: remoteSettings.reviewCenterThemeId || DEFAULT_SYSTEM_SETTINGS.reviewCenterThemeId,
            reviewCenterCustomColor: remoteSettings.reviewCenterCustomColor || undefined,
            lastUpdated: (remoteSettings as any).updatedAt || new Date().toISOString(),
            updatedBy: (remoteSettings as any).updatedBy,
          };

          saveStoredSystemSettings(merged);
          set({ settings: merged, hasLoadedFromDb: true });

          // Apply to DOM
          if (merged.adminThemeId === "custom" && merged.adminCustomColor) {
            applyCustomColorToDOM(merged.adminCustomColor);
          } else {
            const preset = ADMIN_THEME_PRESETS.find((p) => p.id === merged.adminThemeId);
            if (preset) applyThemeToDOM(preset);
          }
        }
      } catch (error) {
        console.warn("Failed to load system settings from database, using cached:", error);
      } finally {
        set({ isLoading: false });
      }
    },

    setAdminTheme: async (presetId: string) => {
      const preset = ADMIN_THEME_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        applyThemeToDOM(preset);
      }
      const updated = {
        ...get().settings,
        adminThemeId: presetId,
        adminCustomColor: undefined,
        lastUpdated: new Date().toISOString(),
      };
      saveStoredSystemSettings(updated);
      set({ settings: updated, isSaving: true });

      try {
        await updateSystemSettingsApi({
          adminThemeId: presetId,
          adminCustomColor: null as any,
        });
      } catch (err) {
        console.error("Failed to persist admin theme to database:", err);
      } finally {
        set({ isSaving: false });
      }
    },

    setAdminCustomColor: async (hex: string) => {
      applyCustomColorToDOM(hex);
      const updated = {
        ...get().settings,
        adminThemeId: "custom",
        adminCustomColor: hex,
        lastUpdated: new Date().toISOString(),
      };
      saveStoredSystemSettings(updated);
      set({ settings: updated, isSaving: true });

      try {
        await updateSystemSettingsApi({
          adminThemeId: "custom",
          adminCustomColor: hex,
        });
      } catch (err) {
        console.error("Failed to persist custom admin color to database:", err);
      } finally {
        set({ isSaving: false });
      }
    },

    setReviewCenterTheme: async (presetId: string) => {
      const updated = {
        ...get().settings,
        reviewCenterThemeId: presetId,
        reviewCenterCustomColor: undefined,
        lastUpdated: new Date().toISOString(),
      };
      saveStoredSystemSettings(updated);
      set({ settings: updated, isSaving: true });

      try {
        await updateSystemSettingsApi({
          reviewCenterThemeId: presetId,
          reviewCenterCustomColor: null as any,
        });
      } catch (err) {
        console.error("Failed to persist review center theme to database:", err);
      } finally {
        set({ isSaving: false });
      }
    },

    setReviewCenterCustomColor: async (hex: string) => {
      const updated = {
        ...get().settings,
        reviewCenterThemeId: "custom",
        reviewCenterCustomColor: hex,
        lastUpdated: new Date().toISOString(),
      };
      saveStoredSystemSettings(updated);
      set({ settings: updated, isSaving: true });

      try {
        await updateSystemSettingsApi({
          reviewCenterThemeId: "custom",
          reviewCenterCustomColor: hex,
        });
      } catch (err) {
        console.error("Failed to persist review center custom color to database:", err);
      } finally {
        set({ isSaving: false });
      }
    },

    setLogoUrl: async (url: string) => {
      const updated = {
        ...get().settings,
        logoUrl: url,
        lastUpdated: new Date().toISOString(),
      };
      saveStoredSystemSettings(updated);
      set({ settings: updated, isSaving: true });

      try {
        await updateSystemSettingsApi({ logoUrl: url });
      } catch (err) {
        console.error("Failed to persist logo to database:", err);
      } finally {
        set({ isSaving: false });
      }
    },

    setSystemName: (name: string) => {
      const updated = {
        ...get().settings,
        systemName: name,
        lastUpdated: new Date().toISOString(),
      };
      saveStoredSystemSettings(updated);
      set({ settings: updated });

      // Debounce database update by 500ms
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          set({ isSaving: true });
          await updateSystemSettingsApi({ systemName: name });
        } catch (err) {
          console.error("Failed to persist system name to database:", err);
        } finally {
          set({ isSaving: false });
        }
      }, 500);
    },

    setInstitutionSubtitle: (sub: string) => {
      const updated = {
        ...get().settings,
        institutionSubtitle: sub,
        lastUpdated: new Date().toISOString(),
      };
      saveStoredSystemSettings(updated);
      set({ settings: updated });

      // Debounce database update by 500ms
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          set({ isSaving: true });
          await updateSystemSettingsApi({ institutionSubtitle: sub });
        } catch (err) {
          console.error("Failed to persist institution subtitle to database:", err);
        } finally {
          set({ isSaving: false });
        }
      }, 500);
    },

    saveSettings: async (partial) => {
      const updated = {
        ...get().settings,
        ...partial,
        lastUpdated: new Date().toISOString(),
      };
      saveStoredSystemSettings(updated);
      set({ settings: updated, isSaving: true });

      if (partial.adminThemeId === "custom" && partial.adminCustomColor) {
        applyCustomColorToDOM(partial.adminCustomColor);
      } else if (partial.adminThemeId) {
        const preset = ADMIN_THEME_PRESETS.find((p) => p.id === partial.adminThemeId);
        if (preset) applyThemeToDOM(preset);
      }

      try {
        await updateSystemSettingsApi(partial);
      } catch (err) {
        console.error("Failed to save settings to database:", err);
      } finally {
        set({ isSaving: false });
      }
    },

    resetToDefaults: async () => {
      set({ isSaving: true });
      try {
        const resetData = await resetSystemSettingsApi();
        const defaults: SystemBrandingSettings = {
          systemName: resetData.systemName || DEFAULT_SYSTEM_SETTINGS.systemName,
          institutionSubtitle: resetData.institutionSubtitle || DEFAULT_SYSTEM_SETTINGS.institutionSubtitle,
          logoUrl: resetData.logoUrl || DEFAULT_SYSTEM_SETTINGS.logoUrl,
          adminThemeId: resetData.adminThemeId || DEFAULT_SYSTEM_SETTINGS.adminThemeId,
          adminCustomColor: undefined,
          reviewCenterThemeId: resetData.reviewCenterThemeId || DEFAULT_SYSTEM_SETTINGS.reviewCenterThemeId,
          reviewCenterCustomColor: undefined,
          lastUpdated: (resetData as any).updatedAt || new Date().toISOString(),
          updatedBy: (resetData as any).updatedBy,
        };

        saveStoredSystemSettings(defaults);
        const defaultAdminPreset = ADMIN_THEME_PRESETS.find((p) => p.id === defaults.adminThemeId);
        if (defaultAdminPreset) applyThemeToDOM(defaultAdminPreset);
        set({ settings: defaults });
      } catch (err) {
        console.error("Failed to reset settings in database, falling back locally:", err);
        const defaults = { ...DEFAULT_SYSTEM_SETTINGS };
        saveStoredSystemSettings(defaults);
        const defaultAdminPreset = ADMIN_THEME_PRESETS.find((p) => p.id === defaults.adminThemeId);
        if (defaultAdminPreset) applyThemeToDOM(defaultAdminPreset);
        set({ settings: defaults });
      } finally {
        set({ isSaving: false });
      }
    },

    initTheme: () => {
      const current = get().settings;
      if (current.adminThemeId === "custom" && current.adminCustomColor) {
        applyCustomColorToDOM(current.adminCustomColor);
      } else {
        const preset = ADMIN_THEME_PRESETS.find((p) => p.id === current.adminThemeId);
        if (preset) {
          applyThemeToDOM(preset);
        }
      }

      // Fetch latest from database on initialization if not yet fetched
      if (!get().hasLoadedFromDb) {
        get().fetchSettings();
      }
    },
  };
});

// Sync across tabs and listen for changes
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "boardquest_system_settings" && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        useSystemSettingsStore.setState({ settings: parsed });
        if (parsed.adminThemeId === "custom" && parsed.adminCustomColor) {
          applyCustomColorToDOM(parsed.adminCustomColor);
        } else {
          const preset = ADMIN_THEME_PRESETS.find((p) => p.id === parsed.adminThemeId);
          if (preset) applyThemeToDOM(preset);
        }
      } catch {}
    }
  });

  window.addEventListener(SYSTEM_SETTINGS_EVENT, (e: any) => {
    if (e.detail) {
      useSystemSettingsStore.setState({ settings: e.detail });
    }
  });
}
