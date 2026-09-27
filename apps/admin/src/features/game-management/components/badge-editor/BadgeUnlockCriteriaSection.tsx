import { Target } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BadgeUnlockCriteriaSectionProps {
  triggerRule?: {
    type: string;
    threshold: number;
  };
  isActive?: boolean;
  onUpdateTriggerRule: (triggerRule: { type: string; threshold: number }) => void;
  onToggleActive: (isActive: boolean) => void;
}

export default function BadgeUnlockCriteriaSection({
  triggerRule = { type: "accuracy", threshold: 80 },
  isActive = true,
  onUpdateTriggerRule,
  onToggleActive,
}: BadgeUnlockCriteriaSectionProps) {
  return (
    <div className="p-4 rounded-2xl border border-border/80 bg-accent/15 space-y-4">
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
          3. Automatic Unlock Criteria
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground">
            Condition Trigger
          </Label>
          <Select
            value={triggerRule.type || "accuracy"}
            onValueChange={(val: string) =>
              onUpdateTriggerRule({
                ...triggerRule,
                type: val,
              })
            }
          >
            <SelectTrigger className="h-9 text-xs font-semibold bg-background">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="accuracy">Min Accuracy (% Score)</SelectItem>
              <SelectItem value="streak">Min Study Streak (Days)</SelectItem>
              <SelectItem value="level">Min Candidate Level</SelectItem>
              <SelectItem value="score">Min Exam Score (%)</SelectItem>
              <SelectItem value="mastery">
                Subject Mastery Proficiency (%)
              </SelectItem>
              <SelectItem value="xp">Total Accumulated XP</SelectItem>
              <SelectItem value="questions">Total Questions Solved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground">
            Threshold Value
          </Label>
          <Input
            type="number"
            placeholder="Threshold value"
            value={triggerRule.threshold ?? 80}
            onChange={(e) =>
              onUpdateTriggerRule({
                ...triggerRule,
                threshold: Number(e.target.value),
              })
            }
            className="h-9 text-xs font-semibold bg-background"
          />
        </div>
      </div>

      {/* Activation Switch */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card">
        <div>
          <span className="text-xs font-bold text-foreground">
            Active in Production
          </span>
          <p className="text-[11px] text-muted-foreground">
            When enabled, aspirants can earn and unlock this badge automatically
          </p>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={onToggleActive}
        />
      </div>
    </div>
  );
}
