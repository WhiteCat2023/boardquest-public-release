import { 
  Building2, 
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
import type { ReviewCenterRepresentative } from "../types";

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
      <DialogContent className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Review Center Profile</DialogTitle>
        </DialogHeader>

        {/* Profile Card Header Banner */}
        <div className="relative -mx-6 -mt-6 p-6 bg-gradient-to-br from-[#A70202] via-red-800 to-amber-900 text-white flex flex-col items-center text-center space-y-3">
          {/* Avatar Icon */}
          <div className="size-16 rounded-2xl bg-white text-[#A70202] font-black text-xl flex items-center justify-center shadow-lg border-2 border-white/40">
            {getInitials(reviewCenter.companyName)}
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">{reviewCenter.companyName}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs font-mono font-medium bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                {reviewCenter.employeeId || "RC-PARTNER"}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-200 bg-emerald-950/40 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={12} className="text-emerald-400" />
                Verified Partner
              </span>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="space-y-4 mt-6">
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
            {/* Representative */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <User size={15} className="text-[#A70202]" />
                Representative
              </span>
              <span className="font-semibold text-slate-800">{reviewCenter.name}</span>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <Mail size={15} className="text-[#A70202]" />
                Email
              </span>
              <a href={`mailto:${reviewCenter.email}`} className="font-semibold text-slate-800 hover:text-[#A70202] underline">
                {reviewCenter.email}
              </a>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <Phone size={15} className="text-[#A70202]" />
                Phone Number
              </span>
              <span className="font-semibold text-slate-800">{reviewCenter.phonenumber || "Not specified"}</span>
            </div>

            {/* Location */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <MapPin size={15} className="text-[#A70202]" />
                Location
              </span>
              <span className="font-semibold text-slate-800">{reviewCenter.location || "Philippines"}</span>
            </div>

            {/* Registered Date */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <Calendar size={15} className="text-[#A70202]" />
                Date Registered
              </span>
              <span className="font-medium text-slate-700">{formattedDate}</span>
            </div>
          </div>

          {/* Badges / Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl flex items-center gap-2.5">
              <Award size={18} className="text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Affiliation</p>
                <p className="text-xs font-semibold text-amber-950">Official Reviewer</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Status</p>
                <p className="text-xs font-semibold text-emerald-950">Active Institution</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-10 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl px-4 cursor-pointer"
          >
            Close
          </Button>

          <Button
            onClick={() => {
              onClose();
              onEditClick(reviewCenter);
            }}
            className="h-10 text-xs font-semibold bg-[#A70202] hover:bg-[#8b0101] text-white rounded-xl px-4 cursor-pointer"
          >
            Edit Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
