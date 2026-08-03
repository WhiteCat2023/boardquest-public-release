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
      description: "Clean, bright aesthetic tailored for day usage.",
      icon: Sun,
    },
    {
      id: "dark",
      name: "Dark Mode",
      description: "Sleek, low-light aesthetic tailored for night usage.",
      icon: Moon,
    },
    {
      id: "system",
      name: "System Default",
      description: "Automatically matches your operating system setting.",
      icon: Laptop,
    },
  ];

  return (
    <Card id="theme" className="bg-card border border-border rounded-3xl shadow-xs overflow-hidden scroll-mt-6 font-sans">
      <CardHeader className="border-b border-border pb-4 pt-6 px-6 bg-card">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          Theme & Color Appearance
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Select your preferred visual mode for BoardQuest.
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                className={`relative flex flex-col justify-between p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-primary ring-2 ring-primary/20 text-foreground shadow-xs"
                    : "bg-muted/50 border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      <Check size={12} /> Active
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground">{opt.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
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
