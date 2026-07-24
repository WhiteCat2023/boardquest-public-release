import { useState } from "react";
import { 
  Building2, 
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

  // Helper to generate colorful avatars based on company name
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
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A70202] via-red-600 to-amber-500 opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Card Content Top */}
      <div className="space-y-4 pt-1">
        {/* Company Header & Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Center Logo/Avatar */}
            <div className="size-11 rounded-xl bg-gradient-to-br from-red-50 to-amber-50 border border-red-100/80 text-[#A70202] flex items-center justify-center font-bold text-sm shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              {getInitials(reviewCenter.companyName)}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight truncate group-hover:text-[#A70202] transition-colors" title={reviewCenter.companyName}>
                {reviewCenter.companyName}
              </h3>
              <span className="inline-block mt-0.5 text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                {reviewCenter.employeeId || "RC-PARTNER"}
              </span>
            </div>
          </div>

          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={11} className="text-emerald-600" />
            Partner
          </span>
        </div>

        {/* Representative Details Section */}
        <div className="pt-3 border-t border-slate-100/80 space-y-2 text-xs">
          {/* Rep Name */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Representative</span>
            <span className="font-semibold text-slate-700 truncate max-w-[170px]" title={reviewCenter.name}>
              {reviewCenter.name}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between group/email">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Mail size={13} className="text-slate-400 shrink-0" />
              Email
            </span>
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-medium text-slate-600 truncate max-w-[140px]" title={reviewCenter.email}>
                {reviewCenter.email}
              </span>
              <button
                onClick={handleCopyEmail}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                title="Copy Email"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* Phone */}
          {reviewCenter.phonenumber && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400 shrink-0" />
                Phone
              </span>
              <span className="font-medium text-slate-600">
                {reviewCenter.phonenumber}
              </span>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              Location
            </span>
            <span className="font-medium text-slate-600 truncate max-w-[160px]" title={reviewCenter.location || "Philippines"}>
              {reviewCenter.location || "Philippines"}
            </span>
          </div>

          {/* Joined Date */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              Registered
            </span>
            <span className="text-slate-500 font-normal text-[11px]">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100/90">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(reviewCenter)}
          className="h-8 text-xs font-semibold text-slate-700 bg-slate-50/60 hover:bg-slate-100 border-slate-200 rounded-xl gap-1.5 px-3 cursor-pointer"
        >
          <Eye size={13} className="text-slate-500" />
          View Details
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(reviewCenter)}
            className="size-8 text-slate-500 hover:text-[#A70202] hover:bg-red-50 rounded-xl cursor-pointer"
            title="Edit Details"
          >
            <Edit3 size={14} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(reviewCenter)}
            className="size-8 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
            title="Delete / Deactivate"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
