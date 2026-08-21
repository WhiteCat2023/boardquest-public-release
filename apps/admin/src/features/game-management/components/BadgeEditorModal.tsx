import React, { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  Flame,
  Zap,
  Crown,
  Sparkles,
  Gem,
  Medal,
  Check,
  Sparkle,
  ShieldCheck,
  Target,
  Trophy,
  Rocket,
  Star,
  Heart,
  Skull,
  Compass,
  BookOpen,
  Swords,
  Flag,
  Feather,
  UploadCloud,
  ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import type { GameBadge, BadgeType, BadgeCategory } from "../types/types";
import { uploadBadgeImageToCloudinary } from "../services/badgeUploadService";

interface BadgeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge?: GameBadge | null;
  onSave: (badgeData: GameBadge) => void;
  isSaving?: boolean;
}

export const BADGE_TYPES: {
  type: BadgeType;
  label: string;
  badgeTag: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  gradient: string;
}[] = [
  {
    type: "bronze",
    label: "Bronze Tier",
    badgeTag: "🥉 BRONZE",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/10",
    gradient: "from-amber-600/20 via-amber-500/5 to-transparent",
  },
  {
    type: "silver",
    label: "Silver Tier",
    badgeTag: "🥈 SILVER",
    color: "text-slate-500 dark:text-slate-300",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-400/30",
    glowColor: "shadow-slate-400/10",
    gradient: "from-slate-400/20 via-slate-500/5 to-transparent",
  },
  {
    type: "gold",
    label: "Gold Tier",
    badgeTag: "🥇 GOLD",
    color: "text-amber-500 dark:text-amber-300",
    bgColor: "bg-amber-500/15",
    borderColor: "border-amber-400/40",
    glowColor: "shadow-amber-400/20",
    gradient: "from-amber-500/25 via-yellow-500/10 to-transparent",
  },
  {
    type: "fire",
    label: "Flame Tier",
    badgeTag: "🔥 FLAME",
    color: "text-orange-500 dark:text-orange-400",
    bgColor: "bg-orange-500/15",
    borderColor: "border-orange-500/40",
    glowColor: "shadow-orange-500/20",
    gradient: "from-orange-500/25 via-rose-500/10 to-transparent",
  },
  {
    type: "lightning",
    label: "Zap Tier",
    badgeTag: "⚡ ZAP",
    color: "text-indigo-500 dark:text-indigo-400",
    bgColor: "bg-indigo-500/15",
    borderColor: "border-indigo-500/40",
    glowColor: "shadow-indigo-500/20",
    gradient: "from-indigo-500/25 via-violet-500/10 to-transparent",
  },
  {
    type: "crown",
    label: "Crown Tier",
    badgeTag: "👑 CROWN",
    color: "text-purple-500 dark:text-purple-300",
    bgColor: "bg-purple-500/15",
    borderColor: "border-purple-500/40",
    glowColor: "shadow-purple-500/20",
    gradient: "from-purple-500/25 via-fuchsia-500/10 to-transparent",
  },
  {
    type: "diamond",
    label: "Diamond Tier",
    badgeTag: "💎 DIAMOND",
    color: "text-cyan-500 dark:text-cyan-300",
    bgColor: "bg-cyan-500/15",
    borderColor: "border-cyan-500/40",
    glowColor: "shadow-cyan-500/20",
    gradient: "from-cyan-500/25 via-teal-500/10 to-transparent",
  },
  {
    type: "emerald",
    label: "Emerald Tier",
    badgeTag: "❇️ EMERALD",
    color: "text-emerald-500 dark:text-emerald-300",
    bgColor: "bg-emerald-500/15",
    borderColor: "border-emerald-500/40",
    glowColor: "shadow-emerald-500/20",
    gradient: "from-emerald-500/25 via-green-500/10 to-transparent",
  },
  {
    type: "ruby",
    label: "Ruby Tier",
    badgeTag: "🌹 RUBY",
    color: "text-rose-500 dark:text-rose-300",
    bgColor: "bg-rose-500/15",
    borderColor: "border-rose-500/40",
    glowColor: "shadow-rose-500/20",
    gradient: "from-rose-500/25 via-pink-500/10 to-transparent",
  },
  {
    type: "cosmic",
    label: "Cosmic Tier",
    badgeTag: "🌌 COSMIC",
    color: "text-fuchsia-500 dark:text-fuchsia-300",
    bgColor: "bg-fuchsia-500/15",
    borderColor: "border-fuchsia-500/40",
    glowColor: "shadow-fuchsia-500/20",
    gradient: "from-fuchsia-500/25 via-indigo-500/10 to-transparent",
  },
];

export const BADGE_CATEGORIES: {
  value: BadgeCategory;
  label: string;
  badgeTag: string;
  description: string;
}[] = [
  {
    value: "QUEST",
    label: "Quest",
    badgeTag: "⚔️ QUEST",
    description: "Evaluations & Quest Arena milestones",
  },
  {
    value: "STREAK",
    label: "Streak",
    badgeTag: "🔥 STREAK",
    description: "Daily continuous study streak milestones",
  },
  {
    value: "BOSS",
    label: "Boss",
    badgeTag: "👑 BOSS",
    description: "Comprehensive subject board mock exams",
  },
  {
    value: "SUBJECT",
    label: "Subject",
    badgeTag: "📚 SUBJECT",
    description: "Subject mastery & proficiency goals",
  },
  {
    value: "EXAM",
    label: "Exam",
    badgeTag: "⚡ EXAM",
    description: "Speed & high precision exam solver",
  },
];

export const ICONS = [
  { name: "Medal", Icon: Medal, label: "Medal" },
  { name: "Trophy", Icon: Trophy, label: "Trophy" },
  { name: "Sparkles", Icon: Sparkles, label: "Sparkles" },
  { name: "Flame", Icon: Flame, label: "Flame" },
  { name: "Award", Icon: Award, label: "Award" },
  { name: "Crown", Icon: Crown, label: "Crown" },
  { name: "Zap", Icon: Zap, label: "Zap" },
  { name: "Gem", Icon: Gem, label: "Gem" },
  { name: "Target", Icon: Target, label: "Target" },
  { name: "ShieldCheck", Icon: ShieldCheck, label: "Shield" },
  { name: "Rocket", Icon: Rocket, label: "Rocket" },
  { name: "Star", Icon: Star, label: "Star" },
  { name: "Heart", Icon: Heart, label: "Heart" },
  { name: "Skull", Icon: Skull, label: "Skull" },
  { name: "Compass", Icon: Compass, label: "Compass" },
  { name: "BookOpen", Icon: BookOpen, label: "Book" },
  { name: "Swords", Icon: Swords, label: "Swords" },
  { name: "Flag", Icon: Flag, label: "Flag" },
  { name: "Feather", Icon: Feather, label: "Feather" },
];

export function BadgeEditorModal({
  isOpen,
  onClose,
  badge,
  onSave,
  isSaving = false,
}: BadgeEditorModalProps) {
  const [formData, setFormData] = useState<Partial<GameBadge>>({
    title: "",
    badgeType: "bronze",
    category: "QUEST",
    description: "",
    xp: 100,
    iconName: "Medal",
    imageUrl: "",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/10",
    isActive: true,
    triggerRule: { type: "accuracy", threshold: 80 },
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (badge) {
      setFormData(badge);
      setImagePreviewUrl(badge.imageUrl || "");
    } else {
      const defaultTier = BADGE_TYPES[0];
      setFormData({
        id: `badge_${Date.now()}`,
        title: "",
        badgeType: defaultTier.type,
        category: "QUEST",
        description: "",
        xp: 100,
        iconName: "Medal",
        imageUrl: "",
        color: defaultTier.color,
        bgColor: defaultTier.bgColor,
        borderColor: defaultTier.borderColor,
        glowColor: defaultTier.glowColor,
        isActive: true,
        triggerRule: { type: "accuracy", threshold: 80 },
      });
      setImagePreviewUrl("");
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
      glowColor: matched?.glowColor || prev.glowColor,
    }));
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP, SVG, GIF)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size exceeds 10MB limit");
      return;
    }

    // Local instant preview
    const localUrl = URL.createObjectURL(file);
    setImagePreviewUrl(localUrl);

    // Upload to Cloudinary badge_icon_image folder
    setUploadingImage(true);
    try {
      const sanitizedName = formData.title
        ? formData.title.trim().replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase()
        : `badge_${Date.now()}`;

      const uploadedUrl = await uploadBadgeImageToCloudinary(file, sanitizedName);
      setImagePreviewUrl(uploadedUrl);
      setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      toast.success("Badge image uploaded to Cloudinary (badge_icon_image)!");
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      toast.error(
        err?.response?.data?.message ||
          "Failed to upload image to Cloudinary. Keeping local preview."
      );
      setFormData((prev) => ({ ...prev, imageUrl: localUrl }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreviewUrl("");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Image removed. Fallback icon will be used.");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.description?.trim()) {
      toast.error("Please fill in badge title and description.");
      return;
    }

    const currentTier =
      BADGE_TYPES.find((t) => t.type === formData.badgeType) || BADGE_TYPES[0];

    onSave({
      id: formData.id || "",
      badgeId:
        formData.badgeId ||
        formData.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: formData.title.trim(),
      name: formData.name || formData.title.trim(),
      category: formData.category || "QUEST",
      description: formData.description.trim(),
      icon: formData.icon || formData.iconName || "trophy",
      spriteUrl: formData.spriteUrl || formData.imageUrl?.trim() || null,
      color: formData.color || currentTier.color,
      unlockCondition:
        formData.unlockCondition || `Complete ${formData.title.trim()}`,
      xpReward: Number(formData.xpReward) || Number(formData.xp) || 50,
      confidenceFactor: Number(formData.confidenceFactor) || 1.0,
      isActive: formData.isActive ?? true,
      badgeType: formData.badgeType || "bronze",
      xp: Number(formData.xpReward) || Number(formData.xp) || 50,
      iconName: formData.iconName || formData.icon || "Medal",
      imageUrl: formData.spriteUrl || formData.imageUrl?.trim() || undefined,
      bgColor: currentTier.bgColor,
      borderColor: currentTier.borderColor,
      glowColor: currentTier.glowColor,
    });
  };

  const activeTierMeta =
    BADGE_TYPES.find((t) => t.type === formData.badgeType) || BADGE_TYPES[0];

  const SelectedIconComp =
    ICONS.find((i) => i.name === formData.iconName)?.Icon || Medal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] p-0 flex flex-col overflow-hidden bg-card border border-border/80 shadow-2xl rounded-2xl">
        {/* Modal Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/80 bg-accent/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/25 shadow-xs">
              <Sparkle className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                {badge ? "Edit Gamification Badge" : "Create Gamification Badge"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Configure badge metadata, upload Cloudinary artwork, fallback icon, tier styling, XP reward, and unlock criteria.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <form
          id="badge-editor-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Inputs & Configuration (7 of 12 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-5">
              {/* Section 1: Badge Artwork & Iconography */}
              <div className="p-4 rounded-2xl border border-border/80 bg-accent/15 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                      1. Badge Artwork & Iconography
                    </h3>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                    Cloudinary Folder: <code className="bg-background px-1.5 py-0.5 rounded border border-border text-primary font-bold">badge_icon_image</code>
                  </span>
                </div>

                {/* Cloudinary Photo Upload */}
                <div>
                  <Label className="text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                    <span>Custom Artwork Upload</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
                  </Label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />

                  {imagePreviewUrl ? (
                    /* Attached Image Box */
                    <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-primary/30 bg-primary/5">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-primary/40 bg-background shadow-sm flex items-center justify-center shrink-0">
                          {uploadingImage ? (
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                          ) : (
                            <img
                              src={imagePreviewUrl}
                              alt="Badge Artwork"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Custom Photo Uploaded</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate max-w-sm mt-0.5">
                            {formData.imageUrl || "Ready for badge display"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingImage}
                          onClick={() => fileInputRef.current?.click()}
                          className="h-8 text-xs font-semibold"
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={uploadingImage}
                          onClick={handleRemoveImage}
                          className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 font-semibold"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Upload Dropzone */
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all ${
                        dragOver
                          ? "border-primary bg-primary/10 scale-[1.01]"
                          : "border-border/80 hover:border-primary/50 hover:bg-accent/40 bg-card/60"
                      }`}
                    >
                      <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 shadow-xs">
                        {uploadingImage ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <UploadCloud className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground">
                          {uploadingImage
                            ? "Uploading artwork to Cloudinary..."
                            : "Click or drag & drop badge artwork image"}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          PNG, JPG, WEBP, SVG • Saved to Cloudinary folder <span className="font-semibold text-primary">badge_icon_image</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fallback Icon Picker */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Fallback Icon Picker
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      Used whenever no custom photo is uploaded
                    </span>
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-10 gap-2">
                    {ICONS.map(({ name, Icon, label }) => {
                      const isSelected = formData.iconName === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setFormData({ ...formData, iconName: name })}
                          title={`${label} Icon`}
                          className={`p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/20 text-primary ring-2 ring-primary/40 shadow-xs scale-105"
                              : "border-border/70 bg-card hover:bg-accent hover:border-primary/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                          <span className="text-[9px] font-semibold truncate max-w-full">
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 2: General Information */}
              <div className="p-4 rounded-2xl border border-border/80 bg-accent/15 space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    2. Badge Details & Identity
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-xs font-bold text-foreground">
                      Badge Title <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Sharp Mind, On Fire"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="h-9 text-xs font-semibold bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs font-bold text-foreground">
                      Category
                    </Label>
                    <Select
                      value={formData.category || "QUEST"}
                      onValueChange={(val: BadgeCategory) =>
                        setFormData({ ...formData, category: val })
                      }
                    >
                      <SelectTrigger id="category" className="h-9 text-xs font-semibold bg-background">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {BADGE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <span className="font-bold mr-1.5">{cat.badgeTag}</span>
                            <span className="text-xs text-muted-foreground">({cat.label})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-bold text-foreground">
                    Description & Unlock Criteria <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Achieved high accuracy (>=80%) on diagnostic evaluations"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                    className="text-xs min-h-[60px] bg-background leading-relaxed"
                    required
                  />
                </div>

                {/* Tier and XP Reward */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="badgeType" className="text-xs font-bold text-foreground">
                      Tier & Visual Theme
                    </Label>
                    <Select
                      value={formData.badgeType || "bronze"}
                      onValueChange={(val: BadgeType) => handleTypeChange(val)}
                    >
                      <SelectTrigger id="badgeType" className="h-9 text-xs font-semibold bg-background">
                        <SelectValue placeholder="Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {BADGE_TYPES.map((bt) => (
                          <SelectItem key={bt.type} value={bt.type}>
                            <span className={`font-bold flex items-center gap-2 ${bt.color}`}>
                              {bt.badgeTag} ({bt.label})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="xp" className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>XP Milestone Reward</span>
                      <span className="text-primary font-bold">+{formData.xp || 100} XP</span>
                    </Label>
                    <Input
                      id="xp"
                      type="number"
                      min={10}
                      step={10}
                      value={formData.xp || 100}
                      onChange={(e) =>
                        setFormData({ ...formData, xp: Number(e.target.value) })
                      }
                      className="h-9 text-xs font-semibold bg-background"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Unlock Rules & Status */}
              <div className="p-4 rounded-2xl border border-border/80 bg-accent/15 space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    3. Automatic Unlock Criteria
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Condition Trigger</Label>
                    <Select
                      value={formData.triggerRule?.type || "accuracy"}
                      onValueChange={(val: any) =>
                        setFormData({
                          ...formData,
                          triggerRule: {
                            ...formData.triggerRule!,
                            type: val,
                          },
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
                        <SelectItem value="mastery">Subject Mastery Proficiency (%)</SelectItem>
                        <SelectItem value="xp">Total Accumulated XP</SelectItem>
                        <SelectItem value="questions">Total Questions Solved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Threshold Value</Label>
                    <Input
                      type="number"
                      placeholder="Threshold value"
                      value={formData.triggerRule?.threshold || 80}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          triggerRule: {
                            ...formData.triggerRule!,
                            threshold: Number(e.target.value),
                          },
                        })
                      }
                      className="h-9 text-xs font-semibold bg-background"
                    />
                  </div>
                </div>

                {/* Activation Switch */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card">
                  <div>
                    <span className="text-xs font-bold text-foreground">Active in Production</span>
                    <p className="text-[11px] text-muted-foreground">
                      When enabled, aspirants can earn and unlock this badge automatically
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive ?? true}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Preview (5 of 12 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    Live Preview
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  {formData.imageUrl ? "Custom Artwork" : "Fallback Icon"}
                </span>
              </div>

              {/* Live Preview Card */}
              <div
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-4 relative overflow-hidden bg-card/95 ${activeTierMeta.borderColor} ${activeTierMeta.bgColor} shadow-xl ${activeTierMeta.glowColor}`}
              >
                {/* Background Ambient Glow */}
                <div
                  className={`absolute -top-12 -left-12 w-40 h-40 rounded-full blur-3xl opacity-35 bg-gradient-to-br ${activeTierMeta.gradient} pointer-events-none`}
                />

                {/* Top Row: Tier Tag & XP Pill */}
                <div className="w-full flex items-center justify-between relative z-10">
                  <span className="text-[9px] font-extrabold tracking-wider uppercase bg-background/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-border shadow-2xs text-muted-foreground">
                    {activeTierMeta.badgeTag}
                  </span>
                  <span className="text-xs font-extrabold text-primary bg-primary/15 px-2.5 py-1 rounded-full border border-primary/25 shadow-2xs">
                    +{formData.xp || 100} XP
                  </span>
                </div>

                {/* Badge Artwork: Custom Cloudinary Image OR Fallback Icon */}
                <div className="my-2 relative z-10">
                  {formData.imageUrl ? (
                    <div
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shadow-lg bg-background flex items-center justify-center p-1 relative ${activeTierMeta.borderColor}`}
                    >
                      <img
                        src={formData.imageUrl}
                        alt="Badge Icon"
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className={`p-4 rounded-2xl border-2 bg-background/90 shadow-lg ${activeTierMeta.color} ${activeTierMeta.borderColor}`}
                    >
                      <SelectedIconComp className="w-9 h-9" />
                    </div>
                  )}
                </div>

                {/* Badge Title & Category */}
                <div className="w-full space-y-1 relative z-10">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block">
                    {formData.category || "Progression"}
                  </span>
                  <h4
                    className={`text-base font-black tracking-tight leading-snug ${activeTierMeta.color} line-clamp-1`}
                  >
                    {formData.title || "Untitled Badge"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed px-2">
                    {formData.description || "Badge unlocking description preview will appear here."}
                  </p>
                </div>

                {/* Unlock Rule Tag */}
                <div className="w-full pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold relative z-10">
                  <span className="text-muted-foreground">Condition:</span>
                  <span className="text-[10px] font-mono font-bold uppercase bg-background/90 px-2 py-0.5 rounded-md border border-border shadow-2xs">
                    {formData.triggerRule?.type} &ge; {formData.triggerRule?.threshold}
                  </span>
                </div>

                {/* Status Indicator */}
                <div className="w-full pt-1 flex items-center justify-between text-xs relative z-10">
                  <span className="text-muted-foreground">Status:</span>
                  {formData.isActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                      Disabled
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Explanation Card */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-accent/20 text-muted-foreground text-[11px] leading-relaxed space-y-1.5">
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Sparkle className="w-3.5 h-3.5 text-primary" /> Live Dynamic Rendering
                </p>
                <p>
                  Artwork is stored in Cloudinary folder <span className="font-bold text-foreground">badge_icon_image</span>. If no custom image is uploaded, students will see the fallback icon with your selected tier glow.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border/80 bg-muted/40 shrink-0 gap-2 flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={uploadingImage}
            className="h-9 text-xs font-semibold px-4 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="badge-editor-form"
            size="sm"
            disabled={uploadingImage}
            className="h-9 text-xs font-bold gap-2 px-5 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
          >
            {uploadingImage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading Artwork...
              </>
            ) : (
              <>
                <Sparkle className="w-4 h-4" />
                {badge ? "Save Changes" : "Create Badge"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
