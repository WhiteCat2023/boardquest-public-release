import { Sliders, HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface RankLevelRangeSectionProps {
  minLevel: number;
  onMinLevelChange: (val: number) => void;
  maxLevel: number | null;
  onMaxLevelChange: (val: number | null) => void;
  isUncapped: boolean;
  onToggleUncapped: (checked: boolean) => void;
  calculatedMinXp: number;
}

export default function RankLevelRangeSection({
  minLevel,
  onMinLevelChange,
  maxLevel,
  onMaxLevelChange,
  isUncapped,
  onToggleUncapped,
  calculatedMinXp,
}: RankLevelRangeSectionProps) {
  return (
    <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">
            Level Range &amp; Requirements
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="uncapped-switch"
            checked={isUncapped}
            onCheckedChange={onToggleUncapped}
          />
          <Label
            htmlFor="uncapped-switch"
            className="text-xs cursor-pointer text-muted-foreground font-medium"
          >
            No Max Cap (50+)
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
        <div className="space-y-1">
          <Label
            htmlFor="min-level"
            className="text-[11px] font-semibold text-muted-foreground"
          >
            Min Level
          </Label>
          <Input
            id="min-level"
            type="number"
            min={1}
            value={minLevel}
            onChange={(e) => onMinLevelChange(Math.max(1, Number(e.target.value)))}
            className="h-9 text-xs font-bold"
          />
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="max-level"
            className="text-[11px] font-semibold text-muted-foreground"
          >
            Max Level
          </Label>
          <Input
            id="max-level"
            type="number"
            min={minLevel}
            value={isUncapped ? "" : maxLevel ?? ""}
            onChange={(e) =>
              onMaxLevelChange(e.target.value ? Number(e.target.value) : null)
            }
            disabled={isUncapped}
            placeholder={isUncapped ? "Uncapped (∞)" : "Max level"}
            className="h-9 text-xs font-bold"
          />
        </div>

        <div className="space-y-1 col-span-2 sm:col-span-1">
          <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            Req. XP <HelpCircle className="w-3 h-3 text-muted-foreground" />
          </Label>
          <div className="h-9 rounded-md border border-border/60 bg-muted px-3 flex items-center text-xs font-extrabold text-foreground">
            {calculatedMinXp.toLocaleString()} XP
          </div>
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground italic flex items-center gap-1">
        <span>Formula:</span>
        <code>XP = (Level - 1)² × 100</code>
      </div>
    </div>
  );
}
