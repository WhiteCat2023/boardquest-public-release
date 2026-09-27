import React from "react";
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
  type RankEditorModalProps,
  getRankIconComponent,
  useRankEditorForm,
  RankLivePreviewCard,
  RankLevelRangeSection,
  RankAppearanceSection,
} from "./rank-editor";

export type { RankEditorModalProps };

export function RankEditorModal({
  isOpen,
  onClose,
  rank,
  onSave,
  isSaving = false,
}: RankEditorModalProps) {
  const {
    isEditing,
    title,
    setTitle,
    description,
    setDescription,
    minLevel,
    setMinLevel,
    maxLevel,
    setMaxLevel,
    isUncapped,
    handleToggleUncapped,
    icon,
    setIcon,
    color,
    setColor,
    isActive,
    setIsActive,
    calculatedMinXp,
    handleSubmit,
  } = useRankEditorForm({
    isOpen,
    rank,
    onSave,
  });

  const SelectedIconComp = getRankIconComponent(icon);

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
          <RankLivePreviewCard
            title={title}
            description={description}
            minLevel={minLevel}
            maxLevel={maxLevel}
            isUncapped={isUncapped}
            calculatedMinXp={calculatedMinXp}
            icon={icon}
            color={color}
            isActive={isActive}
            rank={rank}
          />

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
                Description &amp; Criteria
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
            <RankLevelRangeSection
              minLevel={minLevel}
              onMinLevelChange={setMinLevel}
              maxLevel={maxLevel}
              onMaxLevelChange={setMaxLevel}
              isUncapped={isUncapped}
              onToggleUncapped={handleToggleUncapped}
              calculatedMinXp={calculatedMinXp}
            />

            {/* Icon Picker & Color Palette */}
            <RankAppearanceSection
              icon={icon}
              onIconChange={setIcon}
              color={color}
              onColorChange={setColor}
            />

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
