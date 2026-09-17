import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  Star,
  Trophy,
  Crown,
  Medal,
  ShieldCheck,
  Flame,
  Zap,
  Target,
  Gem,
  Sparkles,
  Rocket,
  Check,
  CheckCircle2,
  Users,
  Eye,
  Sliders,
  HelpCircle,
} from "lucide-react";
import type { RankTier } from "../types/types";

const ICONS_LIST = [
  { name: "Award", icon: Award, label: "Award" },
  { name: "Star", icon: Star, label: "Star" },
  { name: "Trophy", icon: Trophy, label: "Trophy" },
  { name: "Crown", icon: Crown, label: "Crown" },
  { name: "Medal", icon: Medal, label: "Medal" },
  { name: "ShieldCheck", icon: ShieldCheck, label: "Shield" },
  { name: "Flame", icon: Flame, label: "Flame" },
  { name: "Zap", icon: Zap, label: "Zap" },
  { name: "Target", icon: Target, label: "Target" },
  { name: "Gem", icon: Gem, label: "Gem" },
  { name: "Sparkles", icon: Sparkles, label: "Sparkles" },
  { name: "Rocket", icon: Rocket, label: "Rocket" },
];

const PRESET_COLORS = [
  { label: "Slate", hex: "#64748B", bg: "bg-slate-500" },
  { label: "Blue", hex: "#3B82F6", bg: "bg-blue-500" },
  { label: "Purple", hex: "#A855F7", bg: "bg-purple-500" },
  { label: "Amber", hex: "#F59E0B", bg: "bg-amber-500" },
  { label: "Emerald", hex: "#10B981", bg: "bg-emerald-500" },
  { label: "Rose", hex: "#F43F5E", bg: "bg-rose-500" },
  { label: "Cyan", hex: "#06B6D4", bg: "bg-cyan-500" },
  { label: "Indigo", hex: "#6366F1", bg: "bg-indigo-500" },
];

interface RankEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  rank?: RankTier | null;
  onSave: (rankData: Partial<RankTier>) => Promise<void> | void;
  isSaving?: boolean;
}

export function RankEditorModal({
  isOpen,
  onClose,
  rank,
  onSave,
  isSaving = false,
}: RankEditorModalProps) {
  const isEditing = Boolean(rank && rank.id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minLevel, setMinLevel] = useState<number>(1);
  const [maxLevel, setMaxLevel] = useState<number | null>(9);
  const [isUncapped, setIsUncapped] = useState<boolean>(false);
  const [icon, setIcon] = useState<string>("Award");
  const [color, setColor] = useState<string>("#3B82F6");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Sync state with rank prop
  useEffect(() => {
    if (rank) {
      setTitle(rank.title || "");
      setDescription(rank.description || "");
      setMinLevel(rank.minLevel ?? 1);
      setMaxLevel(rank.maxLevel ?? null);
      setIsUncapped(rank.maxLevel === null || rank.maxLevel === undefined);
      setIcon(rank.icon || "Award");
      setColor(rank.color || "#3B82F6");
      setIsActive(rank.isActive ?? true);
    } else {
      // Default for new tier
      setTitle("");
      setDescription("");
      setMinLevel(1);
      setMaxLevel(9);
      setIsUncapped(false);
      setIcon("Award");
      setColor("#3B82F6");
      setIsActive(true);
    }
  }, [rank, isOpen]);

  // Handle Uncapped Level checkbox
  const handleToggleUncapped = (checked: boolean) => {
    setIsUncapped(checked);
    if (checked) {
      setMaxLevel(null);
    } else {
      setMaxLevel(minLevel + 9);
    }
  };

  // Calculated min XP based on BoardQuesters quadratic formula
  const calculatedMinXp = minLevel > 1 ? Math.pow(minLevel - 1, 2) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSave({
      ...(rank ? { id: rank.id } : {}),
      title: title.trim(),
      name: title.trim(),
      description: description.trim(),
      minLevel: Number(minLevel),
      maxLevel: isUncapped ? null : maxLevel !== null ? Number(maxLevel) : null,
      minXp: calculatedMinXp,
      icon,
      color,
      isActive,
    });
  };

  const SelectedIconComp =
    ICONS_LIST.find((i) => i.name.toLowerCase() === icon.toLowerCase())?.icon ||
    Award;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/80 bg-card">
        <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl text-white shadow-md flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <SelectedIconComp className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {isEditing ? "Edit Aspirant Rank Tier" : "Create New Rank Tier"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Configure student progression level requirements, icon styling, and XP thresholds.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Live Preview Card */}
          <div className="rounded-2xl p-5 border border-border/80 bg-background/60 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Live Aspirant Card Preview
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card shadow-sm">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md relative group shrink-0"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 8px 24px -4px ${color}40`,
                  }}
                >
                  <SelectedIconComp className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground tracking-tight">
                    {title || "Untitled Rank Tier"}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm mt-0.5">
                    {description || "No description provided yet."}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/80">
                      Level {minLevel} {isUncapped ? "+" : `– ${maxLevel ?? ""}`}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {calculatedMinXp.toLocaleString()} Min XP
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
                <div className="text-[11px] text-muted-foreground">Enrolled Students</div>
                <div className="text-lg font-extrabold text-foreground mt-0.5">
                  {(rank?.studentCount ?? 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="rank-title" className="text-xs font-bold text-foreground">
                Rank Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rank-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Diagnostician"
                required
                className="h-10 text-sm font-medium"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="rank-desc" className="text-xs font-bold text-foreground">
                Description & Criteria
              </Label>
              <Textarea
                id="rank-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly explain what achievements or milestones this rank represents..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>

            {/* Level Range & Formula */}
            <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">Level Range & Requirements</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="uncapped-switch"
                    checked={isUncapped}
                    onCheckedChange={handleToggleUncapped}
                  />
                  <Label htmlFor="uncapped-switch" className="text-xs cursor-pointer text-muted-foreground font-medium">
                    No Max Cap (50+)
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="space-y-1">
                  <Label htmlFor="min-level" className="text-[11px] font-semibold text-muted-foreground">
                    Min Level
                  </Label>
                  <Input
                    id="min-level"
                    type="number"
                    min={1}
                    value={minLevel}
                    onChange={(e) => setMinLevel(Math.max(1, Number(e.target.value)))}
                    className="h-9 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="max-level" className="text-[11px] font-semibold text-muted-foreground">
                    Max Level
                  </Label>
                  <Input
                    id="max-level"
                    type="number"
                    min={minLevel}
                    value={isUncapped ? "" : maxLevel ?? ""}
                    onChange={(e) => setMaxLevel(e.target.value ? Number(e.target.value) : null)}
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

            {/* Icon Picker */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-foreground">Rank Badge Icon</Label>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {ICONS_LIST.map((item) => {
                  const ItemIcon = item.icon;
                  const isSelected = icon.toLowerCase() === item.name.toLowerCase();
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIcon(item.name)}
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
              <Label className="text-xs font-bold text-foreground">Accent Color Theme</Label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((c) => {
                  const isSelected = color.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
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
                    onChange={(e) => setColor(e.target.value)}
                    className="w-7 h-7 p-0 border border-border rounded-lg cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Active Status Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-background">
              <div>
                <Label htmlFor="rank-status-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                  Active Status
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  When enabled, students can attain this rank tier in BoardQuesters.
                </p>
              </div>
              <Switch
                id="rank-status-toggle"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 pt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="text-xs font-bold cursor-pointer gap-1.5"
            >
              {isSaving ? "Saving Rank..." : isEditing ? "Save Changes" : "Create Rank Tier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RankEditorModal;
