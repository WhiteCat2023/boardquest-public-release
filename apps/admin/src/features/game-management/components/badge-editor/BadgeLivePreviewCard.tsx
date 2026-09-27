import { Eye, Sparkle, Check, Medal } from "lucide-react";
import type { GameBadge } from "../../types/types";
import { BADGE_TYPES, ICONS } from "./badgeEditorConstants";

interface BadgeLivePreviewCardProps {
  formData: Partial<GameBadge>;
  imagePreviewUrl: string;
  isCloudUploaded: boolean;
}

export default function BadgeLivePreviewCard({
  formData,
  imagePreviewUrl,
  isCloudUploaded,
}: BadgeLivePreviewCardProps) {
  const activeTierMeta =
    BADGE_TYPES.find((t) => t.type === formData.badgeType) || BADGE_TYPES[0];

  const SelectedIconComp =
    ICONS.find((i) => i.name === formData.iconName)?.Icon || Medal;

  return (
    <div className="lg:col-span-5 xl:col-span-4 sticky top-0 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
            Live Preview
          </h3>
        </div>
        <span
          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
            imagePreviewUrl
              ? isCloudUploaded
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
              : "text-primary bg-primary/10 border-primary/20"
          }`}
        >
          {imagePreviewUrl
            ? isCloudUploaded
              ? "Cloud Artwork"
              : "Local Preview"
            : "Fallback Icon"}
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

        {/* Badge Artwork: Custom Cloud/Preview Image OR Fallback Icon */}
        <div className="my-2 relative z-10">
          {imagePreviewUrl ? (
            <div
              className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shadow-lg bg-background flex items-center justify-center p-1 relative ${activeTierMeta.borderColor}`}
            >
              <img
                src={imagePreviewUrl}
                alt="Badge Icon Preview"
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
            {formData.description ||
              "Badge unlocking description preview will appear here."}
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
          Artwork is stored in Supabase Storage folder{" "}
          <span className="font-bold text-foreground">badge_icon_image</span>. If
          no custom image is uploaded, students will see the fallback icon with
          your selected tier glow.
        </p>
      </div>
    </div>
  );
}
