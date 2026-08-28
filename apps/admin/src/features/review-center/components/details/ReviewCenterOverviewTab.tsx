import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Award,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type { ReviewCenterRepresentative } from "../../types/types";

interface ReviewCenterOverviewTabProps {
  reviewCenter: ReviewCenterRepresentative | null | undefined;
  studentsCount: number;
  schedulesCount: number;
  formatDate: (dateString?: string) => string;
  onNavigateStudentsTab: () => void;
  onNavigateSchedulesTab: () => void;
}

export default function ReviewCenterOverviewTab({
  reviewCenter,
  studentsCount,
  schedulesCount,
  formatDate,
  onNavigateStudentsTab,
  onNavigateSchedulesTab,
}: ReviewCenterOverviewTabProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!reviewCenter?.email) return;
    navigator.clipboard.writeText(reviewCenter.email);
    setCopiedEmail(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 font-sans">
      {/* ── Key Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Enrolled Students Card */}
        <div className="p-4 bg-card border border-border/80 rounded-2xl flex items-center justify-between shadow-2xs hover:border-primary/30 transition-all text-left">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground block truncate">
              Enrolled Candidates
            </span>
            <p className="text-2xl font-extrabold text-foreground tracking-tight">
              {studentsCount}
            </p>
            <button
              type="button"
              onClick={onNavigateStudentsTab}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-0.5"
            >
              View Student Roster <ArrowRight size={11} />
            </button>
          </div>
          <div className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-2xl shrink-0 shadow-2xs">
            <GraduationCap size={22} />
          </div>
        </div>

        {/* Active Schedules Card */}
        <div className="p-4 bg-card border border-border/80 rounded-2xl flex items-center justify-between shadow-2xs hover:border-primary/30 transition-all text-left">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground block truncate">
              Review Programs & Batches
            </span>
            <p className="text-2xl font-extrabold text-foreground tracking-tight">
              {schedulesCount}
            </p>
            <button
              type="button"
              onClick={onNavigateSchedulesTab}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-0.5"
            >
              Batch Schedules <ArrowRight size={11} />
            </button>
          </div>
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-2xl shrink-0 shadow-2xs">
            <Calendar size={22} />
          </div>
        </div>

        {/* Regional Location Card */}
        <div className="p-4 bg-card border border-border/80 rounded-2xl flex items-center justify-between shadow-2xs hover:border-primary/30 transition-all text-left">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground block truncate">
              Regional Coverage
            </span>
            <p className="text-lg font-bold text-foreground tracking-tight truncate">
              {reviewCenter?.location || "Philippines"}
            </p>
            <span className="text-[11px] text-muted-foreground block pt-0.5">
              Accredited Jurisdiction
            </span>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-2xl shrink-0 shadow-2xs">
            <MapPin size={22} />
          </div>
        </div>
      </div>

      {/* ── 2-Column Details Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Contact & Profile Card (3 cols) */}
        <Card className="lg:col-span-3 p-4 bg-card border border-border/80 rounded-2xl space-y-3 shadow-2xs h-full">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <h3 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5">
              <Building2 size={14} className="text-primary" /> Representative & Contact Details
            </h3>
            <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0">
              Verified Profile
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            {/* Representative Name */}
            <div className="p-2.5 bg-muted/30 border border-border/60 rounded-xl flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1.5">
                <User size={13} className="text-primary" /> Representative Name
              </span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-foreground text-xs truncate">
                  {reviewCenter?.name || "Representative"}
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="p-2.5 bg-muted/30 border border-border/60 rounded-xl flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1.5">
                <Mail size={13} className="text-primary" /> Contact Email
              </span>
              <div className="flex items-center gap-1.5 min-w-0">
                <a
                  href={`mailto:${reviewCenter?.email}`}
                  className="font-semibold text-foreground hover:text-primary underline truncate max-w-[200px]"
                >
                  {reviewCenter?.email || "N/A"}
                </a>
                {reviewCenter?.email && (
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedEmail ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="p-2.5 bg-muted/30 border border-border/60 rounded-xl flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1.5">
                <Phone size={13} className="text-primary" /> Phone Contact
              </span>
              <span className="font-bold text-foreground text-xs">
                {reviewCenter?.phonenumber || "Not specified"}
              </span>
            </div>

            {/* Location */}
            <div className="p-2.5 bg-muted/30 border border-border/60 rounded-xl flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1.5">
                <MapPin size={13} className="text-primary" /> Campus / Location
              </span>
              <span className="font-bold text-foreground text-xs">
                {reviewCenter?.location || "Philippines"}
              </span>
            </div>

            {/* Registration Date */}
            <div className="p-2.5 bg-muted/30 border border-border/60 rounded-xl flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1.5">
                <Calendar size={13} className="text-primary" /> Date Registered
              </span>
              <span className="font-bold text-foreground text-xs">
                {formatDate(reviewCenter?.createdAt)}
              </span>
            </div>
          </div>
        </Card>

        {/* Institutional Standing Card (2 cols) */}
        <Card className="lg:col-span-2 p-4 bg-card border border-border/80 rounded-2xl space-y-3 shadow-2xs h-full">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <h3 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" /> Standing & Credentials
            </h3>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold"
            >
              Active
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5">
              <Award size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Affiliation Tier
                </p>
                <p className="text-xs font-bold text-foreground">
                  Official Reviewer Partner
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5">
              <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Partner Status
                </p>
                <p className="text-xs font-bold text-foreground">
                  Verified Academic Institution
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2.5">
              <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Portal Access
                </p>
                <p className="text-xs font-bold text-foreground">
                  External Representative Login
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
