import { User, IdCard, Shield, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InternalUserFormFieldsProps {
  firstName: string;
  onFirstNameChange: (val: string) => void;
  middleName: string;
  onMiddleNameChange: (val: string) => void;
  lastName: string;
  onLastNameChange: (val: string) => void;
  employeeId: string;
  onEmployeeIdChange: (val: string) => void;
  role: string;
  onRoleChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (val: string) => void;
}

export default function InternalUserFormFields({
  firstName,
  onFirstNameChange,
  middleName,
  onMiddleNameChange,
  lastName,
  onLastNameChange,
  employeeId,
  onEmployeeIdChange,
  role,
  onRoleChange,
  email,
  onEmailChange,
  phoneNumber,
  onPhoneNumberChange,
}: InternalUserFormFieldsProps) {
  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-3 gap-2.5">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <User size={11} /> First Name <span className="text-primary">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="Jane"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <User size={11} /> Middle Name
          </Label>
          <Input
            type="text"
            placeholder="Smith"
            value={middleName}
            onChange={(e) => onMiddleNameChange(e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <User size={11} /> Last Name <span className="text-primary">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="Doe"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <IdCard size={12} /> Employee ID <span className="text-primary">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="EMP-001"
            value={employeeId}
            onChange={(e) => onEmployeeIdChange(e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Shield size={12} /> System Role <span className="text-primary">*</span>
          </Label>
          <Select value={role} onValueChange={onRoleChange}>
            <SelectTrigger className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TEACHER">TEACHER</SelectItem>
              <SelectItem value="TEAMLEAD">TEAM LEAD</SelectItem>
              <SelectItem value="DEAN">DEAN</SelectItem>
              <SelectItem value="SUPERADMIN">SUPERADMIN</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={12} /> Email <span className="text-primary">*</span>
          </Label>
          <Input
            type="email"
            required
            placeholder="user@boardquest.edu"
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
