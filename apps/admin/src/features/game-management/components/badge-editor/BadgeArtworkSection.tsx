import type { RefObject } from "react";
import {
  ImageIcon,
  UploadCloud,
  Loader2,
  CheckCircle2,
  Eye,
  X,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ICONS } from "./badgeEditorConstants";

interface BadgeArtworkSectionProps {
  imagePreviewUrl: string;
  selectedFile: File | null;
  isCloudUploaded: boolean;
  uploadingImage: boolean;
  dragOver: boolean;
  selectedIconName: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  imageUrl?: string | null;
  onFileSelect: (file: File) => void;
  onRemoveImage: () => void;
  onSelectIcon: (iconName: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export default function BadgeArtworkSection({
  imagePreviewUrl,
  selectedFile,
  isCloudUploaded,
  uploadingImage,
  dragOver,
  selectedIconName,
  fileInputRef,
  imageUrl,
  onFileSelect,
  onRemoveImage,
  onSelectIcon,
  onDragOver,
  onDragLeave,
  onDrop,
}: BadgeArtworkSectionProps) {
  return (
    <div className="p-4 rounded-2xl border border-border/80 bg-accent/15 space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
            1. Badge Artwork & Iconography
          </h3>
        </div>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
          Storage Folder:{" "}
          <code className="bg-background px-1.5 py-0.5 rounded border border-border text-primary font-bold">
            badge_icon_image
          </code>
        </span>
      </div>

      {/* Badge Artwork Upload & Preview */}
      <div>
        <Label className="text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
          <span>Custom Artwork Upload</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            Optional
          </span>
        </Label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFileSelect(e.target.files[0]);
            }
          }}
        />

        {imagePreviewUrl ? (
          /* Attached Image Preview Box */
          <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-primary/40 bg-background shadow-xs flex items-center justify-center shrink-0">
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  ) : (
                    <img
                      src={imagePreviewUrl}
                      alt="Badge Artwork Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    {isCloudUploaded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-emerald-700 dark:text-emerald-400">
                          Cloud Storage Artwork
                        </span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-amber-700 dark:text-amber-400">
                          Local Preview (Pending Cloud Upload)
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate max-w-sm mt-0.5 font-mono">
                    {selectedFile
                      ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`
                      : imageUrl || "Ready for badge display"}
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
                  className="h-8 text-xs font-semibold cursor-pointer"
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploadingImage}
                  onClick={onRemoveImage}
                  className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 font-semibold cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Remove
                </Button>
              </div>
            </div>

            {selectedFile && !isCloudUploaded && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px]">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span>
                  Previewing local file. It will be automatically uploaded to
                  Supabase Storage when you save this badge.
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Upload Dropzone */
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
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
                  ? "Uploading artwork to Cloud Storage..."
                  : "Click or drag & drop badge artwork image"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                PNG, JPG, WEBP, SVG • Previews instantly before uploading to
                Supabase Storage folder{" "}
                <span className="font-semibold text-primary">
                  badge_icon_image
                </span>
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
            const isSelected = selectedIconName === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => onSelectIcon(name)}
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
  );
}
