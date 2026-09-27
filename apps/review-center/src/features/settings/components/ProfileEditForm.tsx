import React from "react";
import {
  User,
  IdCard,
  Mail,
  Phone,
  Building2,
  MapPin,
  X,
  Save,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface ProfileEditFormProps {
  name: string;
  employeeId: string;
  phonenumber: string;
  location: string;
  companyName: string;
  email?: string;
  isSaving: boolean;
  onNameChange: (value: string) => void;
  onEmployeeIdChange: (value: string) => void;
  onPhonenumberChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileEditForm({
  name,
  employeeId,
  phonenumber,
  location,
  companyName,
  email,
  isSaving,
  onNameChange,
  onEmployeeIdChange,
  onPhonenumberChange,
  onLocationChange,
  onCompanyNameChange,
  onCancel,
  onSubmit,
}: ProfileEditFormProps) {
  return (
    <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col animate-in fade-in duration-200">
      <CardHeader className="border-b border-border pb-4 pt-5 px-5 sm:px-6 bg-card flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            Edit profile information
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Update your primary representative credentials, contact details, and organization name.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X size={15} className="mr-1" /> Cancel
        </Button>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="profile-name"
                className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
              >
                <User size={12} className="text-primary" /> Full Name{" "}
                <span className="text-primary">*</span>
              </Label>
              <Input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g. Dennis Fabian"
                className="h-10 px-3.5 rounded-xl text-xs sm:text-sm font-medium"
                required
              />
              <span className="text-[10.5px] text-muted-foreground">
                Primary representative name displayed on assessment logs and cohort reports.
              </span>
            </div>

            {/* Employee ID */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="profile-employee-id"
                className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
              >
                <IdCard size={12} className="text-indigo-500" /> Employee ID / Reference Code
              </Label>
              <Input
                id="profile-employee-id"
                type="text"
                value={employeeId}
                onChange={(e) => onEmployeeIdChange(e.target.value)}
                placeholder="e.g. RC-8454"
                className="h-10 px-3.5 rounded-xl text-xs sm:text-sm font-medium font-mono"
              />
              <span className="text-[10.5px] text-muted-foreground">
                Institutional partner identification reference.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Address (Read-only) */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="profile-email"
                className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
              >
                <Mail size={12} className="text-primary" /> Email Address
              </Label>
              <Input
                id="profile-email"
                type="email"
                value={email || ""}
                disabled
                className="h-10 px-3.5 bg-muted/60 border border-border/80 rounded-xl text-xs sm:text-sm text-muted-foreground cursor-not-allowed font-medium"
              />
              <span className="text-[10.5px] text-muted-foreground">
                Contact administration to update your primary institutional login email.
              </span>
            </div>

            {/* Contact Phone */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="profile-phone"
                className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
              >
                <Phone size={12} className="text-primary" /> Contact Phone
              </Label>
              <Input
                id="profile-phone"
                type="text"
                value={phonenumber}
                onChange={(e) => onPhonenumberChange(e.target.value)}
                placeholder="e.g. 09345593456"
                className="h-10 px-3.5 rounded-xl text-xs sm:text-sm font-medium font-mono"
              />
              <span className="text-[10.5px] text-muted-foreground">
                Direct contact phone for candidate moderation inquiries.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Organization Name */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="profile-org"
                className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
              >
                <Building2 size={12} className="text-primary" /> Partner Organization Name
              </Label>
              <Input
                id="profile-org"
                type="text"
                value={companyName}
                onChange={(e) => onCompanyNameChange(e.target.value)}
                placeholder="e.g. Apex Medical Review Center"
                className="h-10 px-3.5 rounded-xl text-xs sm:text-sm font-medium"
              />
              <span className="text-[10.5px] text-muted-foreground">
                Official review center brand name linked to candidate rosters.
              </span>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="profile-location"
                className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
              >
                <MapPin size={12} className="text-primary" /> Location / Address
              </Label>
              <Input
                id="profile-location"
                type="text"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="e.g. Cebu City, Philippines"
                className="h-10 px-3.5 rounded-xl text-xs sm:text-sm font-medium"
              />
              <span className="text-[10.5px] text-muted-foreground">
                Headquarters city or branch address.
              </span>
            </div>
          </div>

          {/* Submission Row */}
          <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-border mt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-10 px-4 rounded-xl text-xs font-bold border-border cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
