import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  name?: string;
  email?: string;
  avatarUrl: string | null;
  initials: string;
  isUploadingAvatar: boolean;
  onUploadAvatar: (file: File) => void;
  onRemoveAvatar: () => void;
}

export function ProfileHeader({
  name,
  email,
  avatarUrl,
  initials,
  isUploadingAvatar,
  onUploadAvatar,
  onRemoveAvatar,
}: ProfileHeaderProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      e.target.value = "";
      onUploadAvatar(file);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Back navigation button */}
      <button
        type="button"
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Back</span>
      </button>

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
        {/* Left Side: Avatar, Name, Role Badges & Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative shrink-0 group self-start">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-border shadow-xs bg-muted text-foreground overflow-hidden">
              {avatarUrl ? (
                <AvatarImage
                  src={avatarUrl}
                  alt={name || "Profile"}
                  className="object-cover size-full"
                />
              ) : null}
              <AvatarFallback className="font-black text-xl sm:text-2xl bg-primary/10 text-primary uppercase rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Hover camera upload overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute inset-0 rounded-2xl bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-xs disabled:cursor-not-allowed"
              title="Change profile picture"
            >
              {isUploadingAvatar ? (
                <Loader2 size={20} className="animate-spin text-white" />
              ) : (
                <>
                  <Camera size={18} className="stroke-[2.5]" />
                  <span className="text-[9.5px] font-bold mt-1">Change</span>
                </>
              )}
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveAvatar();
                }}
                disabled={isUploadingAvatar}
                className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shadow-xs hover:bg-destructive/90 z-20"
                title="Remove profile picture"
              >
                <Trash2 size={10} />
              </button>
            )}

            <span
              className="absolute -bottom-1 -right-1 size-3.5 sm:size-4 rounded-full bg-emerald-500 border-2 border-card ring-2 ring-emerald-400/20 z-10"
              title="Account Active"
            />
          </div>

          <div className="space-y-1.5 min-w-0">
            {/* Name + Role & Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight capitalize truncate">
                {name || "Administrator"}
              </h1>
            </div>

            {/* Subtitle: Email, Administrative Scope, Location */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="truncate">{email || "email@university.edu"}</span>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="sr-only hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
