import { Building2, User, IdCard, MapPin, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExternalUserFormFieldsProps {
  companyName: string;
  onCompanyNameChange: (val: string) => void;
  firstName: string;
  onFirstNameChange: (val: string) => void;
  lastName: string;
  onLastNameChange: (val: string) => void;
  employeeId: string;
  onEmployeeIdChange: (val: string) => void;
  location: string;
  onLocationChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (val: string) => void;
}

export default function ExternalUserFormFields({
  companyName,
  onCompanyNameChange,
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  employeeId,
  onEmployeeIdChange,
  location,
  onLocationChange,
  email,
  onEmailChange,
  phoneNumber,
  onPhoneNumberChange,
}: ExternalUserFormFieldsProps) {
  return (
    <div className="space-y-3.5">
      {/* Organization / Review Center */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Building2
            size={12}
            className="text-purple-600 dark:text-purple-400"
          />
          Organization / Review Center <span className="text-primary">*</span>
        </Label>
        <Input
          type="text"
          required
          placeholder="e.g. TopRank Review Academy"
          value={companyName}
          onChange={(e) => onCompanyNameChange(e.target.value)}
          className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
        />
      </div>

      {/* First and Last Name */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User size={12} /> First Name <span className="text-primary">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="e.g. Roberto"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User size={12} /> Last Name <span className="text-primary">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="e.g. Cruz"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Partner ID and Location */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <IdCard size={12} /> Partner ID <span className="text-primary">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="e.g. RC-1001"
            value={employeeId}
            onChange={(e) => onEmployeeIdChange(e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={12} /> Location / Branch
          </Label>
          <Input
            type="text"
            placeholder="e.g. Manila Campus"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={12} /> Email <span className="text-primary">*</span>
          </Label>
          <Input
            type="email"
            required
            placeholder="partner@review.edu.ph"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={12} /> Phone Number <span className="text-primary">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="09171234567"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
          />
        </div>
      </div>
    </div>
  );
}
