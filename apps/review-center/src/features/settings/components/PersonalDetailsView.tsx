import React from "react";
import { Building2, MapPin, CheckCircle2, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface PersonalDetailsViewProps {
  name?: string;
  phonenumber?: string;
  employeeId?: string;
  location?: string;
  email?: string;
  companyName?: string;
  onEdit: () => void;
}

export function PersonalDetailsView({
  name,
  phonenumber,
  employeeId,
  location = "Philippines",
  email,
  companyName,
  onEdit,
}: PersonalDetailsViewProps) {
  return (
    <div className="flex flex-col gap-5 w-full animate-in fade-in duration-200">
      {/* Personal Information Card */}
      <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col gap-6">
          {/* Header with Title and Pencil Edit Button */}
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                Personal information
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your authenticated partner representative profile on the BoardQuest network.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              id="edit-representative-btn"
              onClick={onEdit}
              className="h-8 px-3 rounded-lg text-xs font-bold border-border/60 hover:border-border cursor-pointer flex items-center gap-1.5"
              title="Edit personal information"
            >
              <Pencil size={14} className="text-primary" />
              <span>Edit Info</span>
            </Button>
          </div>

          {/* 2-Column Key-Value Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 sm:gap-x-12">
            {/* Row 1 */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">Full name</span>
              <span className="text-sm font-semibold text-foreground capitalize">
                {name || "Representative"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">Phone number</span>
              <span className="text-sm font-semibold text-foreground font-mono">
                {phonenumber || "None provided"}
              </span>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">
                Identity document (Employee ID / Ref)
              </span>
              <span className="text-sm font-semibold text-primary font-mono">
                {employeeId || "RC-REPRESENTATIVE"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">Location</span>
              <span className="text-sm font-semibold text-foreground">
                {location}
              </span>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">Assigned role</span>
              <span className="text-sm font-semibold text-foreground">
                Review Center Partner (External)
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">Account status</span>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-foreground">Active</span>
              </div>
            </div>

            {/* Row 4 */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">Email address</span>
              <span className="text-sm font-semibold text-foreground break-all">
                {email || "representative@reviewcenter.com"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">Administrative scope</span>
              <span className="text-sm font-semibold text-foreground">
                Candidate Assessment &amp; Evaluation Cohorts
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Partner Organization & Network Linkage Card */}
      <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Building2 size={16} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  Partner Organization &amp; Linkage
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Registered review center institution linked with BoardQuest Dean &amp; Faculty Hub.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 sm:gap-x-12">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">Company / Organization Name</span>
              <span className="text-sm font-bold text-foreground">
                {companyName || "Review Center Partner"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">Headquarters Location</span>
              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" />
                {location}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">Network Linkage</span>
              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Synced with BoardQuest Dean &amp; Faculty Hub
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">Data Synchronization</span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                Student rosters and cohort assessments automatically link to this institutional hub.
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
