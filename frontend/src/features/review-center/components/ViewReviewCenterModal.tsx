import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck,
  Award
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ReviewCenterRepresentative } from "@/features/review-center";

interface ViewReviewCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewCenter: ReviewCenterRepresentative | null;
  onEditClick: (item: ReviewCenterRepresentative) => void;
}

export default function ViewReviewCenterModal({
  isOpen,
  onClose,
  reviewCenter,
  onEditClick,
}: ViewReviewCenterModalProps) {
  if (!reviewCenter) return null;

  const formattedDate = reviewCenter.createdAt
    ? new Date(reviewCenter.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const getInitials = (name: string) => {
    if (!name) return "RC";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-3xl p-6 border border-border shadow-2xl max-w-md w-full overflow-hidden text-foreground font-sans">
        <DialogHeader className="sr-only">
          <DialogTitle>Review Center Profile</DialogTitle>
        </DialogHeader>

        {/* Profile Card Header Banner */}
        <div className="relative -mx-6 -mt-6 p-6 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground flex flex-col items-center text-center space-y-3">
          {/* Avatar Icon */}
          <div className="size-16 rounded-2xl bg-primary-foreground text-primary font-black text-xl flex items-center justify-center shadow-lg border-2 border-primary-foreground/40">
            {getInitials(reviewCenter.companyName)}
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-primary-foreground">{reviewCenter.companyName}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs font-mono font-medium bg-primary-foreground/15 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                {reviewCenter.employeeId || "RC-PARTNER"}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={12} className="text-emerald-400" />
                Verified Partner
              </span>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="space-y-4 mt-6">
          <div className="space-y-3 bg-muted/40 p-4 rounded-2xl border border-border">
            {/* Representative */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <User size={15} className="text-primary" />
                Representative
              </span>
              <span className="font-semibold text-foreground">{reviewCenter.name}</span>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <Mail size={15} className="text-primary" />
                Email
              </span>
              <a href={`mailto:${reviewCenter.email}`} className="font-semibold text-foreground hover:text-primary underline">
                {reviewCenter.email}
              </a>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <Phone size={15} className="text-primary" />
                Phone Number
              </span>
              <span className="font-semibold text-foreground">{reviewCenter.phonenumber || "Not specified"}</span>
            </div>

            {/* Location */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <MapPin size={15} className="text-primary" />
                Location
              </span>
              <span className="font-semibold text-foreground">{reviewCenter.location || "Philippines"}</span>
            </div>

            {/* Registered Date */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <Calendar size={15} className="text-primary" />
                Date Registered
              </span>
              <span className="font-medium text-foreground/90">{formattedDate}</span>
            </div>
          </div>

          {/* Badges / Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5">
              <Award size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Affiliation</p>
                <p className="text-xs font-semibold text-foreground">Official Reviewer</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Status</p>
                <p className="text-xs font-semibold text-foreground">Active Institution</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-10 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground rounded-xl px-4 cursor-pointer"
          >
            Close
          </Button>

          <Button
            onClick={() => {
              onClose();
              onEditClick(reviewCenter);
            }}
            className="h-10 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 cursor-pointer shadow-xs"
          >
            Edit Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
