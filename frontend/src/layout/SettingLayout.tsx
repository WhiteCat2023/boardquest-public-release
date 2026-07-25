import { useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { 
  Sparkles, 
  Bell, 
  LayoutGrid, 
  ShieldCheck, 
  Search, 
  X, 
  Sliders 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SystemSettingSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
}

const SYSTEM_SETTING_SECTIONS: SystemSettingSection[] = [
  {
    id: "theme",
    title: "Theme & Appearance",
    description: "Light, dark & system color theme",
    icon: Sparkles,
    category: "Visual",
  },
  {
    id: "notifications",
    title: "Notification Preferences",
    description: "Email, security & weekly digest alerts",
    icon: Bell,
    category: "Alerts",
  },
  {
    id: "display",
    title: "Display & View Options",
    description: "Table pagination size & compact mode",
    icon: LayoutGrid,
    category: "Display",
  },
  {
    id: "security",
    title: "Security & Login Alerts",
    description: "Multi-factor & device login alerts",
    icon: ShieldCheck,
    category: "Security",
  },
];

export default function SettingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const currentHash = location.hash.replace("#", "") || "theme";

  const filteredSections = SYSTEM_SETTING_SECTIONS.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSection = (sectionId: string) => {
    navigate(`/settings#${sectionId}`);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4.5rem)] overflow-hidden font-sans bg-background text-foreground">
      {/* Left Sidebar: System Settings Navigation */}
      <div className="w-full lg:w-80 shrink-0 border-r border-border bg-card flex flex-col h-full">
        {/* Search & Section Header */}
        <div className="p-4 border-b border-border flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={14} className="text-primary" />
              System Settings
            </h2>
            <Badge variant="outline" className="text-[10px] font-bold">
              {filteredSections.length} Sections
            </Badge>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search setting options..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-muted/40 border-border rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-primary placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Settings Navigation Sections */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {filteredSections.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground font-medium italic">
              No matching settings found.
            </div>
          ) : (
            filteredSections.map((item) => {
              const Icon = item.icon;
              const isActive = currentHash === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectSection(item.id)}
                  className={`p-3.5 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? "bg-primary/10 border-l-4 border-primary text-primary"
                      : "hover:bg-accent border-l-4 border-transparent text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className={`text-xs font-bold ${
                          isActive
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon size={16} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={isActive ? "default" : "outline"}
                    className="text-[9px] font-bold shrink-0 px-2 py-0.5 rounded-full"
                  >
                    {item.category}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Content View */}
      <div className="flex-1 overflow-y-auto bg-background h-full p-6 md:p-8">
        <Outlet />
      </div>
    </div>
  );
}