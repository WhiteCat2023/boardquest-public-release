import { Label } from "@/components/ui/label";
import { ICONS_LIST, PRESET_COLORS } from "./rankEditorConstants";

interface RankAppearanceSectionProps {
  icon: string;
  onIconChange: (iconName: string) => void;
  color: string;
  onColorChange: (hexColor: string) => void;
}

export default function RankAppearanceSection({
  icon,
  onIconChange,
  color,
  onColorChange,
}: RankAppearanceSectionProps) {
  return (
    <div className="space-y-4">
      {/* Icon Picker */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-foreground">
          Rank Badge Icon
        </Label>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
          {ICONS_LIST.map((item) => {
            const ItemIcon = item.icon;
            const isSelected = icon.toLowerCase() === item.name.toLowerCase();
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => onIconChange(item.name)}
                className={`h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-primary bg-primary/10 text-primary scale-105"
                    : "border border-border/80 bg-background text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                title={item.label}
              >
                <ItemIcon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Palette */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-foreground">
          Accent Color Theme
        </Label>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_COLORS.map((c) => {
            const isSelected = color.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => onColorChange(c.hex)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/40 bg-accent font-bold"
                    : "border-border bg-background hover:bg-accent/60"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-xs"
                  style={{ backgroundColor: c.hex }}
                />
                <span>{c.label}</span>
              </button>
            );
          })}

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-muted-foreground">Custom:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-7 h-7 p-0 border border-border rounded-lg cursor-pointer bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
