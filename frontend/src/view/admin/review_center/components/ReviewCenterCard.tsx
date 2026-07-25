import { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ReviewCenterRepresentative } from "../types";

interface ReviewCenterCardProps {
  reviewCenter: ReviewCenterRepresentative;
  onView: (item: ReviewCenterRepresentative) => void;
  onEdit: (item: ReviewCenterRepresentative) => void;
  onDelete: (item: ReviewCenterRepresentative) => void;
}

export default function ReviewCenterCard({
  reviewCenter,
  onView,
  onEdit,
  onDelete,
}: ReviewCenterCardProps) {
  const [copied, setCopied] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return "RC";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(reviewCenter.email);
    setCopied(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = reviewCenter.createdAt
    ? new Date(reviewCenter.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recent";

  return (
    <div className="bg-card border border-border hover:border-primary/30 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-amber-500 opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Card Content Top */}
      <div className="space-y-4 pt-1">
        {/* Company Header & Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Center Logo/Avatar */}
            <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              {getInitials(reviewCenter.companyName)}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground tracking-tight truncate group-hover:text-primary transition-colors" title={reviewCenter.companyName}>
                {reviewCenter.companyName}
              </h3>
              <span className="inline-block mt-0.5 text-[11px] font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                {reviewCenter.employeeId || "RC-PARTNER"}
              </span>
            </div>
          </div>

          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={11} className="text-emerald-500" />
            Partner
          </span>
        </div>

        {/* Representative Details Section */}
        <div className="pt-3 border-t border-border space-y-2 text-xs">
          {/* Rep Name */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Representative</span>
            <span className="font-semibold text-foreground truncate max-w-[170px]" title={reviewCenter.name}>
              {reviewCenter.name}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between group/email">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Mail size={13} className="text-muted-foreground/70 shrink-0" />
              Email
            </span>
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-medium text-foreground/90 truncate max-w-[140px]" title={reviewCenter.email}>
                {reviewCenter.email}
              </span>
              <button
                onClick={handleCopyEmail}
                className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors cursor-pointer"
                title="Copy Email"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* Phone */}
          {reviewCenter.phonenumber && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Phone size={13} className="text-muted-foreground/70 shrink-0" />
                Phone
              </span>
              <span className="font-medium text-foreground/90">
                {reviewCenter.phonenumber}
              </span>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <MapPin size={13} className="text-muted-foreground/70 shrink-0" />
              Location
            </span>
            <span className="font-medium text-foreground/90 truncate max-w-[160px]" title={reviewCenter.location || "Philippines"}>
              {reviewCenter.location || "Philippines"}
            </span>
          </div>

          {/* Joined Date */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Calendar size={13} className="text-muted-foreground/70 shrink-0" />
              Registered
            </span>
            <span className="text-muted-foreground font-normal text-[11px]">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(reviewCenter)}
          className="h-8 text-xs font-semibold text-foreground bg-muted/40 hover:bg-accent border-border rounded-xl gap-1.5 px-3 cursor-pointer"
        >
          <Eye size={13} className="text-muted-foreground" />
          View Details
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(reviewCenter)}
            className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl cursor-pointer"
            title="Edit Details"
          >
            <Edit3 size={14} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(reviewCenter)}
            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
            title="Delete / Deactivate"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
