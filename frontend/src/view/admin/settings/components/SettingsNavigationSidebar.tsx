import { Sparkles, Bell, LayoutGrid } from "lucide-react";

interface SettingsNavigationSidebarProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
}

export default function SettingsNavigationSidebar({
  activeSection,
  onSelectSection,
}: SettingsNavigationSidebarProps) {
  const navItems = [
    {
      id: "theme",
      title: "Theme & Appearance",
      description: "Light, Dark, and System modes",
      icon: Sparkles,
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Email & security alerts",
      icon: Bell,
    },
    {
      id: "display",
      title: "Display Options",
      description: "Page size & density",
      icon: LayoutGrid,
    },
  ];

  return (
    <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2 font-sans">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-1">
        Navigation
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectSection(item.id)}
            className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              isActive
                ? "bg-primary/10 border-primary/30 text-primary font-bold shadow-2xs"
                : "bg-card border-border hover:bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`p-2 rounded-xl border shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              <Icon size={16} />
            </div>

            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate">{item.title}</div>
              <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                {item.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
