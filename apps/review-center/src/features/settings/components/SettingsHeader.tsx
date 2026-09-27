import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface SettingsHeaderProps {
  name?: string;
  email?: string;
  companyName?: string;
  location?: string;
  role?: string;
  status?: string;
  onBack?: () => void;
}

export function SettingsHeader({
  name,
  email,
  companyName,
  location = "Philippines",
  role = "Review Center Partner",
  status = "ACTIVE",
  onBack,
}: SettingsHeaderProps) {
  const navigate = useNavigate();
  const displayName = name || "Representative";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Back navigation button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit h-auto px-2 py-1 -ml-2"
      >
        <ArrowLeft size={14} />
        <span>Back to Previous Page</span>
      </Button>

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
        {/* Left Side: Avatar, Name, Role Badges & Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative shrink-0 group self-start">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-border shadow-xs bg-muted text-foreground overflow-hidden">
              <AvatarFallback className="font-black text-xl sm:text-2xl bg-primary/10 text-primary uppercase rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <span
              className="absolute -bottom-1 -right-1 size-3.5 sm:size-4 rounded-full bg-emerald-500 border-2 border-card ring-2 ring-emerald-400/20 z-10"
              title="Account Active"
            />
          </div>

          <div className="space-y-1.5 min-w-0">
            {/* Name + Role & Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight capitalize truncate">
                {displayName}
              </h1>
              <Badge variant="success">
                {status}
              </Badge>
              <Badge variant="secondary">
                {role}
              </Badge>
            </div>

            {/* Subtitle: Email, Institution, Location */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="truncate">{email || "representative@reviewcenter.com"}</span>
              <span>•</span>
              <span className="font-semibold text-primary">
                {companyName || "Review Center Partner"}
              </span>
              <span>•</span>
              <span>{location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
