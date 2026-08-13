import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Award, Flame, Zap, Crown, Sparkles, Gem, Medal, Check, Sparkle, ShieldCheck, Target } from "lucide-react";
import type { GameBadge, BadgeType, BadgeCategory } from "../types/types";

interface BadgeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge?: GameBadge | null;
  onSave: (badgeData: GameBadge) => void;
}

const BADGE_TYPES: { type: BadgeType; label: string; color: string; bgColor: string; borderColor: string }[] = [
  { type: "bronze", label: "Bronze Tier", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  { type: "silver", label: "Silver Tier", color: "text-slate-600 dark:text-slate-300", bgColor: "bg-slate-500/10", borderColor: "border-slate-500/20" },
  { type: "gold", label: "Gold Tier", color: "text-amber-500 dark:text-amber-300", bgColor: "bg-amber-500/15", borderColor: "border-amber-500/30" },
  { type: "fire", label: "Flame Tier", color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20" },
  { type: "lightning", label: "Zap Tier", color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/20" },
  { type: "crown", label: "Crown Tier", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20" },
  { type: "diamond", label: "Diamond Tier", color: "text-cyan-600 dark:text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/20" },
];

const CATEGORIES: BadgeCategory[] = [
  "Progression",
  "Excellence",
  "Consistency",
  "Precision",
  "Subject Mastery",
  "Dedication",
  "Elite Status",
];

const ICONS = [
  { name: "Medal", Icon: Medal },
  { name: "Sparkles", Icon: Sparkles },
  { name: "Flame", Icon: Flame },
  { name: "Award", Icon: Award },
  { name: "Crown", Icon: Crown },
  { name: "Zap", Icon: Zap },
  { name: "Gem", Icon: Gem },
  { name: "Target", Icon: Target },
  { name: "ShieldCheck", Icon: ShieldCheck },
];

export function BadgeEditorModal({ isOpen, onClose, badge, onSave }: BadgeEditorModalProps) {
  const [formData, setFormData] = useState<Partial<GameBadge>>({
    title: "",
    badgeType: "bronze",
    category: "Progression",
    description: "",
    xp: 100,
    iconName: "Medal",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    isActive: true,
    triggerRule: { type: "accuracy", threshold: 80 },
  });

  useEffect(() => {
    if (badge) {
      setFormData(badge);
    } else {
      setFormData({
        id: `badge_${Date.now()}`,
        title: "",
        badgeType: "bronze",
        category: "Progression",
        description: "",
        xp: 100,
        iconName: "Medal",
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        isActive: true,
        triggerRule: { type: "accuracy", threshold: 80 },
      });
    }
  }, [badge, isOpen]);

  const handleTypeChange = (type: BadgeType) => {
    const matched = BADGE_TYPES.find((b) => b.type === type);
    setFormData((prev) => ({
      ...prev,
      badgeType: type,
      color: matched?.color || prev.color,
      bgColor: matched?.bgColor || prev.bgColor,
      borderColor: matched?.borderColor || prev.borderColor,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    onSave({
      id: formData.id || `badge_${Date.now()}`,
      title: formData.title || "Untitled Badge",
      badgeType: formData.badgeType || "bronze",
      category: formData.category || "Progression",
      description: formData.description || "",
      xp: Number(formData.xp) || 100,
      iconName: formData.iconName || "Medal",
      color: formData.color || "text-amber-600",
      bgColor: formData.bgColor || "bg-amber-500/10",
      borderColor: formData.borderColor || "border-amber-500/20",
      isActive: formData.isActive ?? true,
      unlockedCount: formData.unlockedCount || 0,
      triggerRule: formData.triggerRule || { type: "accuracy", threshold: 80 },
    });
    onClose();
  };

  const SelectedIconComp = ICONS.find((i) => i.name === formData.iconName)?.Icon || Medal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl sm:max-w-2xl overflow-y-auto max-h-[90vh] p-4 sm:p-5">
        <DialogHeader className="pb-2 border-b border-border">
          <DialogTitle className="text-base font-bold flex items-center gap-1.5">
            <Sparkle className="w-4 h-4 text-primary animate-pulse" />
            {badge ? "Edit Badge" : "Create Badge"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configure badge metadata, tier styling, XP rewards, and automatic unlock rules.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left 2 Cols: Form Inputs */}
            <div className="md:col-span-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="title" className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Sharp Mind"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="category" className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Category</Label>
                  <Select
                    value={formData.category || "Progression"}
                    onValueChange={(val: BadgeCategory) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger id="category" className="h-8 text-xs">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Achieved >=80% accuracy in evaluation"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="text-xs min-h-[50px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="badgeType" className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Tier / Style</Label>
                  <Select
                    value={formData.badgeType || "bronze"}
                    onValueChange={(val: BadgeType) => handleTypeChange(val)}
                  >
                    <SelectTrigger id="badgeType" className="h-8 text-xs">
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {BADGE_TYPES.map((bt) => (
                        <SelectItem key={bt.type} value={bt.type}>
                          <span className={bt.color}>{bt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="xp" className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">XP Reward</Label>
                  <Input
                    id="xp"
                    type="number"
                    min={10}
                    step={10}
                    value={formData.xp || 100}
                    onChange={(e) => setFormData({ ...formData, xp: Number(e.target.value) })}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Icon Selector */}
              <div className="space-y-1">
                <Label className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Select Icon</Label>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {ICONS.map(({ name, Icon }) => {
                    const isSelected = formData.iconName === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setFormData({ ...formData, iconName: name })}
                        className={`p-1.5 rounded-lg border transition-all flex items-center justify-center ${
                          isSelected
                            ? "border-primary bg-primary/15 text-primary ring-1 ring-primary/30"
                            : "border-border bg-card hover:bg-accent text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trigger Rule Section */}
              <div className="pt-2 border-t border-border space-y-2">
                <Label className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-primary" /> Unlock Rule
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={formData.triggerRule?.type || "accuracy"}
                    onValueChange={(val: any) =>
                      setFormData({
                        ...formData,
                        triggerRule: { ...formData.triggerRule!, type: val },
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accuracy">Min Accuracy (%)</SelectItem>
                      <SelectItem value="streak">Min Streak (Days)</SelectItem>
                      <SelectItem value="level">Min Level</SelectItem>
                      <SelectItem value="score">Min Score (%)</SelectItem>
                      <SelectItem value="xp">Total XP</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="Threshold"
                    value={formData.triggerRule?.threshold || 80}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        triggerRule: { ...formData.triggerRule!, threshold: Number(e.target.value) },
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-accent/30">
                <div>
                  <span className="text-xs font-bold">Enable Badge</span>
                  <p className="text-[10px] text-muted-foreground">Unlockable by students</p>
                </div>
                <Switch
                  checked={formData.isActive ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>

            {/* Right Col: Live Card Visual Preview */}
            <div className="space-y-2 flex flex-col justify-start">
              <Label className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground text-center">Live Preview</Label>
              <div
                className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col items-center text-center gap-2 relative overflow-hidden ${formData.bgColor} ${formData.borderColor} shadow-2xs`}
              >
                <div className={`p-2.5 rounded-xl border bg-card shadow-2xs ${formData.color} ${formData.borderColor}`}>
                  <SelectedIconComp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${formData.color}`}>{formData.title || "Badge Title"}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[180px] leading-tight">
                    {formData.description || "Badge description preview will appear here."}
                  </p>
                </div>

                <div className="w-full pt-1.5 border-t border-border/40 flex items-center justify-between text-[10px] font-semibold">
                  <span className="text-muted-foreground">{formData.category}</span>
                  <span className="text-primary font-bold">+{formData.xp || 100} XP</span>
                </div>

                {formData.isActive ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                    <Check className="w-2.5 h-2.5" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/20">
                    Disabled
                  </span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-8 text-xs font-semibold shadow-2xs">
              Save Badge
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
