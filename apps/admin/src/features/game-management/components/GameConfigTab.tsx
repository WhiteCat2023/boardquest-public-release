import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Save,
  RotateCcw,
  Zap,
  Flame,
  ShieldAlert,
  Sparkles,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import type { GameConfigSettings } from "../types/types";

export function GameConfigTab() {
  const [config, setConfig] = useState<GameConfigSettings>({
    baseXP: 10,
    xpMultiplier: 1.5,
    streakBonusPercentage: 10,
    accuracyThreshold: 70,
    levelUpXpBase: 100,
    maxLevelCap: 50,
  });

  const handleSave = () => {
    toast.success("Game engine configuration updated successfully!");
  };

  const handleReset = () => {
    setConfig({
      baseXP: 10,
      xpMultiplier: 1.5,
      streakBonusPercentage: 10,
      accuracyThreshold: 70,
      levelUpXpBase: 100,
      maxLevelCap: 50,
    });
    toast.info("Restored default game engine parameters.");
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <Card className="border-border shadow-2xs">
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="text-base font-bold flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-primary" /> XP & Scoring Engine
            Parameters
          </CardTitle>
          <CardDescription className="text-xs">
            Configure base XP payouts, difficulty scaling multipliers, and
            accuracy bonus triggers.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Base XP */}
            <div className="space-y-1">
              <Label className="font-bold text-xs flex items-center justify-between">
                <span>Base Question XP</span>
                <span className="text-primary font-bold">
                  {config.baseXP} XP
                </span>
              </Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={config.baseXP}
                onChange={(e) =>
                  setConfig({ ...config, baseXP: Number(e.target.value) })
                }
                className="h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Base XP per correct evaluation question.
              </p>
            </div>

            {/* Streak Bonus */}
            <div className="space-y-1">
              <Label className="font-bold text-xs flex items-center justify-between">
                <span>Streak Bonus %</span>
                <span className="text-orange-500 font-bold">
                  +{config.streakBonusPercentage}% / day
                </span>
              </Label>
              <Input
                type="number"
                min={0}
                max={50}
                value={config.streakBonusPercentage}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    streakBonusPercentage: Number(e.target.value),
                  })
                }
                className="h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Bonus XP multiplier per active streak day.
              </p>
            </div>

            {/* Accuracy Threshold */}
            <div className="space-y-1">
              <Label className="font-bold text-xs flex items-center justify-between">
                <span>Accuracy Bonus Threshold</span>
                <span className="text-emerald-500 font-bold">
                  &ge; {config.accuracyThreshold}%
                </span>
              </Label>
              <Input
                type="number"
                min={50}
                max={100}
                value={config.accuracyThreshold}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    accuracyThreshold: Number(e.target.value),
                  })
                }
                className="h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Min accuracy required for +20% bonus XP.
              </p>
            </div>

            {/* Level Up XP Base */}
            <div className="space-y-1">
              <Label className="font-bold text-xs flex items-center justify-between">
                <span>Level-Up Base XP</span>
                <span className="text-indigo-500 font-bold">
                  {config.levelUpXpBase} XP
                </span>
              </Label>
              <Input
                type="number"
                min={50}
                max={1000}
                step={50}
                value={config.levelUpXpBase}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    levelUpXpBase: Number(e.target.value),
                  })
                }
                className="h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Base XP to advance from Level 1 to 2.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="h-8 text-xs font-semibold gap-1 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" /> Save Rules
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
