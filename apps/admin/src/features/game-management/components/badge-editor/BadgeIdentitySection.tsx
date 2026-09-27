import React from "react";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GameBadge, BadgeType, BadgeCategory } from "../../types/types";
import {
  BADGE_TYPES,
  BADGE_CATEGORIES,
  BOARDQUESTERS_PRESETS,
  type BoardQuesterPreset,
} from "./badgeEditorConstants";

interface BadgeIdentitySectionProps {
  formData: Partial<GameBadge>;
  onUpdateField: (updates: Partial<GameBadge>) => void;
  onTypeChange: (type: BadgeType) => void;
  onApplyPreset: (preset: BoardQuesterPreset) => void;
}

export default function BadgeIdentitySection({
  formData,
  onUpdateField,
  onTypeChange,
  onApplyPreset,
}: BadgeIdentitySectionProps) {
  return (
    <div className="p-4 rounded-2xl border border-border/80 bg-accent/15 space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
            2. Badge Details & Identity
          </h3>
        </div>
        <span className="text-[10px] text-muted-foreground font-semibold">
          Synced with BoardQuesters Engine
        </span>
      </div>

      {/* Quick Presets Bar */}
      <div className="space-y-1.5 p-2.5 rounded-xl bg-background/60 border border-border/80">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>BoardQuesters Preset Badges (Click to auto-populate)</span>
          </Label>
          <span className="text-[10px] font-mono text-muted-foreground">
            Standard Game Slugs
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {BOARDQUESTERS_PRESETS.map((p) => (
            <button
              key={p.badgeId}
              type="button"
              onClick={() => onApplyPreset(p)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer ${
                formData.badgeId === p.badgeId
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-card hover:bg-accent hover:border-primary/50 text-foreground border-border/80"
              }`}
            >
              {p.title}{" "}
              <span className="font-mono text-[9px] opacity-75">
                ({p.badgeId})
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-xs font-bold text-foreground">
            Badge Title <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g., Speed Master, Master"
            value={formData.title || ""}
            onChange={(e) => {
              const val = e.target.value;
              onUpdateField({
                title: val,
                badgeId: formData.badgeId
                  ? formData.badgeId
                  : val.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
              });
            }}
            className="h-9 text-xs font-semibold bg-background"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="badgeId"
            className="text-xs font-bold text-foreground flex items-center justify-between"
          >
            <span>
              Badge Slug / ID <span className="text-rose-500">*</span>
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Game linking slug
            </span>
          </Label>
          <Input
            id="badgeId"
            placeholder="e.g., speed, master, gold, streak-7"
            value={formData.badgeId || ""}
            onChange={(e) =>
              onUpdateField({
                badgeId: e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]+/g, "-"),
              })
            }
            className="h-9 text-xs font-mono font-semibold bg-background"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-xs font-bold text-foreground">
            Category
          </Label>
          <Select
            value={formData.category || "QUEST"}
            onValueChange={(val: BadgeCategory) =>
              onUpdateField({ category: val })
            }
          >
            <SelectTrigger
              id="category"
              className="h-9 text-xs font-semibold bg-background"
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {BADGE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <span className="font-bold mr-1.5">{cat.badgeTag}</span>
                  <span className="text-xs text-muted-foreground">
                    ({cat.label})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="unlockCondition"
            className="text-xs font-bold text-foreground"
          >
            Unlock Condition Short Text
          </Label>
          <Input
            id="unlockCondition"
            placeholder="e.g., 100% perfect accuracy, 7-day streak"
            value={formData.unlockCondition || ""}
            onChange={(e) =>
              onUpdateField({ unlockCondition: e.target.value })
            }
            className="h-9 text-xs font-semibold bg-background"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="description"
          className="text-xs font-bold text-foreground"
        >
          Description & Unlock Details <span className="text-rose-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="e.g., Earned by completing a quest with 100% perfect accuracy."
          value={formData.description || ""}
          onChange={(e) => onUpdateField({ description: e.target.value })}
          rows={2}
          className="text-xs min-h-[60px] bg-background leading-relaxed"
          required
        />
      </div>

      {/* Tier and XP Reward */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="badgeType"
            className="text-xs font-bold text-foreground"
          >
            Tier & Visual Theme
          </Label>
          <Select
            value={formData.badgeType || "bronze"}
            onValueChange={(val: BadgeType) => onTypeChange(val)}
          >
            <SelectTrigger
              id="badgeType"
              className="h-9 text-xs font-semibold bg-background"
            >
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              {BADGE_TYPES.map((bt) => (
                <SelectItem key={bt.type} value={bt.type}>
                  <span
                    className={`font-bold flex items-center gap-2 ${bt.color}`}
                  >
                    {bt.badgeTag} ({bt.label})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="xp"
            className="text-xs font-bold text-foreground flex items-center justify-between"
          >
            <span>XP Milestone Reward</span>
            <span className="text-primary font-bold">
              +{formData.xp || 100} XP
            </span>
          </Label>
          <Input
            id="xp"
            type="number"
            min={10}
            step={10}
            value={formData.xp || 100}
            onChange={(e) =>
              onUpdateField({ xp: Number(e.target.value) })
            }
            className="h-9 text-xs font-semibold bg-background"
            required
          />
        </div>
      </div>
    </div>
  );
}
