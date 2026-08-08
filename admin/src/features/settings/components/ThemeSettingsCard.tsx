import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Sparkles, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function ThemeSettingsCard() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      id: "light",
      name: "Light Mode",
      description: "Clean, bright day aesthetic.",
      icon: Sun,
    },
    {
      id: "dark",
      name: "Dark Mode",
      description: "Sleek, low-light night aesthetic.",
      icon: Moon,
    },
    {
      id: "system",
      name: "System Default",
      description: "Sync with OS theme settings.",
      icon: Laptop,
    },
  ];

  return (
    <Card id="theme" className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden scroll-mt-6 font-sans">
      <CardHeader className="border-b border-border py-3 px-4 md:px-5 bg-card">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          Theme & Appearance
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 md:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTheme(opt.id);
                  toast.success(`Theme set to ${opt.name}`);
                }}
                className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-primary ring-1 ring-primary/20 text-foreground shadow-2xs"
                    : "bg-muted/30 border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`p-2 rounded-lg border shrink-0 ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border"
                  }`}
                >
                  <Icon size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs font-bold text-foreground truncate">{opt.name}</h3>
                    {isSelected && <Check size={13} className="text-primary shrink-0" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate leading-snug mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
