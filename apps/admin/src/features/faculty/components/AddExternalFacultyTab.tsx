import React, { useState, useEffect } from "react";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  Sparkles, 
  AlertCircle,
  IdCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/types/question";
import type { CreateFacultyPayload } from "@/features/faculty";

interface AddExternalFacultyTabProps {
  errorMsg: string;
  isPending: boolean;
  onSubmitExternal: (payload: CreateFacultyPayload) => void;
  onCancel: () => void;
}

export default function AddExternalFacultyTab({
  errorMsg,
  isPending,
  onSubmitExternal,
  onCancel,
}: AddExternalFacultyTabProps) {
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("Philippines");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    // Generate a default Partner ID
    setEmployeeId(`RC-${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!companyName.trim()) {
      setLocalError("Review Center / Company name is required.");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setLocalError("Representative First Name and Last Name are required.");
      return;
    }
    if (!email.trim()) {
      setLocalError("Official contact email address is required.");
      return;
    }
    if (!phoneNumber.trim()) {
      setLocalError("Contact phone number is required.");
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const payload: CreateFacultyPayload = {
      employeeId: employeeId.trim() || `RC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      companyName: companyName.trim(),
      location: location.trim() || "Philippines",
      role: UserRole.EXTERNAL,
    };

    onSubmitExternal(payload);
  };

  const displayedError = errorMsg || localError;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {displayedError && (
        <div className="flex items-center gap-2.5 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-semibold animate-in fade-in duration-150">
          <AlertCircle size={16} className="shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}

      {/* Security Scope Notice */}
      <div className="flex items-start gap-3 p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-900 dark:text-purple-300">
        <ShieldAlert size={18} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-purple-800 dark:text-purple-200">
            External Portal Access Only
          </p>
          <p className="text-purple-700 dark:text-purple-300/80 leading-relaxed">
            External accounts are dedicated exclusively to Review Center Representatives. This account cannot log into or manage the BoardQuest administrative console and will only be authenticated within the Review Center application.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 md:p-6 shadow-xs flex flex-col gap-5 font-sans text-foreground">
        {/* Section Header */}
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
          <div className="p-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-500/20">
            <Building2 size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Review Center Representative Profile
            </h2>
            <p className="text-xs text-muted-foreground">
              Set up credentials and organization info for external partners.
            </p>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company / Review Center Name */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={12} className="text-purple-600 dark:text-purple-400" />
              Review Center / Organization Name <span className="text-primary">*</span>
            </Label>
            <Input
              type="text"
              required
              placeholder="e.g. TopRank Review Academy, St. Jude Review Center"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* First Name */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} className="text-muted-foreground" />
              Representative First Name <span className="text-primary">*</span>
            </Label>
            <Input
              type="text"
              required
              placeholder="e.g. Roberto"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} className="text-muted-foreground" />
              Representative Last Name <span className="text-primary">*</span>
            </Label>
            <Input
              type="text"
              required
              placeholder="e.g. Cruz"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Partner / Employee ID */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <IdCard size={12} className="text-muted-foreground" />
              Partner / Representative ID <span className="text-primary">*</span>
            </Label>
            <Input
              type="text"
              required
              placeholder="e.g. RC-4092"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs font-mono placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Contact Email */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={12} className="text-muted-foreground" />
              Official Contact Email <span className="text-primary">*</span>
            </Label>
            <Input
              type="email"
              required
              placeholder="e.g. rep@toprankreview.edu.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={12} className="text-muted-foreground" />
              Contact Phone Number <span className="text-primary">*</span>
            </Label>
            <Input
              type="tel"
              required
              placeholder="e.g. +63 917 123 4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Location / Campus */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12} className="text-muted-foreground" />
              Branch / Campus Location
            </Label>
            <Input
              type="text"
              placeholder="e.g. Sampaloc, Manila (or Philippines)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="cursor-pointer border-border hover:bg-accent text-foreground font-semibold px-4 py-2 rounded-lg h-9 text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-purple-600 text-white hover:bg-purple-700 cursor-pointer font-semibold px-6 py-2 rounded-lg h-9 text-xs shadow-xs transition-all flex items-center gap-1.5"
        >
          {isPending ? (
            <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5" />
          ) : (
            <Sparkles size={14} />
          )}
          Create External Partner Account
        </Button>
      </div>
    </form>
  );
}
