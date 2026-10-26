import { useEffect, useState } from "react";
import defaultLogo from "@/assets/baordquest-no-title.png";
import { apiAxios } from "@/lib/axios";

const STORAGE_KEY = "boardquest_system_settings";
const EVENT_NAME = "boardquest_system_settings_updated";

const REVIEW_PRESETS: Record<string, { primary: string; ring: string; preview: string }> = {
  "monochrome-zinc": {
    primary: "oklch(0.205 0 0)",
    ring: "oklch(0.708 0 0)",
    preview: "#18181b",
  },
  "maroon-heritage": {
    primary: "oklch(0.425 0.215 25)",
    ring: "oklch(0.425 0.215 25)",
    preview: "#800000",
  },
  "ocean-teal": {
    primary: "oklch(0.45 0.15 195)",
    ring: "oklch(0.45 0.15 195)",
    preview: "#0d9488",
  },
  "deep-indigo": {
    primary: "oklch(0.43 0.21 265)",
    ring: "oklch(0.43 0.21 265)",
    preview: "#4338ca",
  },
  "emerald-clinical": {
    primary: "oklch(0.45 0.16 150)",
    ring: "oklch(0.45 0.16 150)",
    preview: "#059669",
  },
};

export function useSystemThemeSync() {
  const [logo, setLogo] = useState<string>(defaultLogo);
  const [systemName, setSystemName] = useState<string>("BoardQuest");

  const applySettings = (data: any) => {
    if (!data) return;
    if (data.logoUrl) setLogo(data.logoUrl);
    if (data.systemName) setSystemName(data.systemName);

    if (typeof document !== "undefined") {
      if (data.reviewCenterThemeId === "custom" && data.reviewCenterCustomColor) {
        const hex = data.reviewCenterCustomColor;
        document.documentElement.style.setProperty("--primary", hex);
        document.documentElement.style.setProperty("--ring", hex);
        document.documentElement.style.setProperty("--chart-1", hex);
        document.documentElement.style.setProperty("--sidebar-primary", hex);
      } else if (data.reviewCenterThemeId) {
        const preset = REVIEW_PRESETS[data.reviewCenterThemeId];
        if (preset) {
          document.documentElement.style.setProperty("--primary", preset.primary);
          document.documentElement.style.setProperty("--ring", preset.ring);
          document.documentElement.style.setProperty("--chart-1", preset.primary);
          document.documentElement.style.setProperty("--sidebar-primary", preset.primary);
        }
      }
    }
  };

  useEffect(() => {
    // 1. Initial quick load from localStorage cache
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          applySettings(JSON.parse(raw));
        }
      } catch {}
    }

    // 2. Fetch ground-truth settings from database via backend API
    const fetchDatabaseSettings = async () => {
      try {
        const res = await apiAxios.get("/system-settings");
        if (res.data?.data) {
          const dbSettings = res.data.data;
          applySettings(dbSettings);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dbSettings));
          } catch {}
        }
      } catch (err) {
        // Quiet fallback if offline or backend rebooting
        console.warn("Could not fetch remote system settings, continuing with local cache:", err);
      }
    };

    fetchDatabaseSettings();

    // 3. Multi-tab and intra-window dynamic synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          applySettings(JSON.parse(e.newValue));
        } catch {}
      }
    };

    const handleCustom = (e: any) => {
      if (e.detail) {
        applySettings(e.detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(EVENT_NAME, handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(EVENT_NAME, handleCustom);
    };
  }, []);

  return { logo, systemName };
}
