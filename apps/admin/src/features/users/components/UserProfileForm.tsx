import { IdCard, User, Mail, Phone, BookOpen, Check, Shield, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateUserPayload, RoleOption, RoleType } from "@/features/users";
import { useSubjects } from "@/features/users";

interface UserProfileFormProps {
  formData: CreateUserPayload;
  firstName: string;
  middleName: string;
  lastName: string;
  allowedRoles: RoleOption[];
  onFirstNameChange: (val: string) => void;
  onMiddleNameChange: (val: string) => void;
  onLastNameChange: (val: string) => void;
  onChange: (field: keyof CreateUserPayload, value: any) => void;
  onCategoryChange: (categoryIds: string[]) => void;
}

export default function UserProfileForm({
  formData,
  firstName,
  middleName,
  lastName,
  allowedRoles,
  onFirstNameChange,
  onMiddleNameChange,
  onLastNameChange,
  onChange,
  onCategoryChange,
}: UserProfileFormProps) {
  const { data: categories = [], isLoading: isCategoriesLoading } = useSubjects();

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 md:p-6 shadow-xs flex flex-col gap-5 font-sans text-foreground">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
        <div className="p-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
          <IdCard size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">
            User Identity & Details
          </h2>
          <p className="text-xs text-muted-foreground">
            Specify employee credentials, system role, and assigned subjects.
          </p>
        </div>
      </div>

      {/* Grid Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* First Name */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User size={12} className="text-muted-foreground" />
            First Name <span className="text-primary">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="e.g. Jane"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Middle Name (Optional) */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User size={12} className="text-muted-foreground" />
            Middle Name{" "}
            <span className="text-muted-foreground font-normal text-[10px] lowercase">
              (optional)
            </span>
          </Label>
          <Input
            type="text"
            placeholder="e.g. Smith"
            value={middleName}
            onChange={(e) => onMiddleNameChange(e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User size={12} className="text-muted-foreground" />
            Last Name <span className="text-primary">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="e.g. Doe"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Employee ID */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <IdCard size={12} className="text-muted-foreground" />
            Employee ID <span className="text-primary">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="e.g. A-516-111"
            value={formData.employeeId}
            onChange={(e) => onChange("employeeId", e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={12} className="text-muted-foreground" />
            Email Address <span className="text-primary">*</span>
          </Label>
          <Input
            type="email"
            required
            placeholder="e.g. jdoe@university.edu"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={12} className="text-muted-foreground" />
            Phone Number <span className="text-primary">*</span>
          </Label>
          <Input
            type="tel"
            required
            placeholder="e.g. 09171234567"
            value={formData.phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Authority Role Dropdown */}
        <div className="flex flex-col gap-1.5 md:col-span-3">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Shield size={12} className="text-muted-foreground" />
            Role <span className="text-primary">*</span>
          </Label>
          <Select
            value={String(formData.role)}
            onValueChange={(val) => {
              const roleVal = (Number(val) || val) as RoleType;
              onChange("role", roleVal);
              const roleStr = String(roleVal).toUpperCase();
              if (roleStr !== "TEACHER") {
                onCategoryChange([]);
              }
            }}
          >
            <SelectTrigger className="w-full h-9 px-3 bg-muted/30 border border-border/80 rounded-lg text-xs text-foreground font-medium">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border rounded-xl shadow-lg z-50 text-popover-foreground">
              {allowedRoles.map((roleOpt) => (
                <SelectItem
                  key={roleOpt.value}
                  value={String(roleOpt.value)}
                  className="cursor-pointer text-xs font-medium hover:bg-accent"
                >
                  {roleOpt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Handled Subjects / Categories - Teacher Roles Only */}
        {String(formData.role).toUpperCase() === "TEACHER" ? (
          <div className="flex flex-col gap-2 md:col-span-3 pt-3 border-t border-border/60">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={12} className="text-muted-foreground" />
                Handled Subjects / Categories
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Select all subject domains managed by this teacher
              </span>
            </div>

            {isCategoriesLoading ? (
              <div className="h-9 bg-muted rounded-lg animate-pulse" />
            ) : categories.length === 0 ? (
              <div className="p-2.5 bg-muted/30 border border-border/60 rounded-lg text-xs text-muted-foreground italic">
                No categories created yet in system.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {categories.map((cat: any) => {
                  const selectedIds = formData.handledSubjectIds || formData.handledCategoryIds || [];
                  const isSelected = selectedIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        const next = isSelected
                          ? selectedIds.filter((id) => id !== cat.id)
                          : [...selectedIds, cat.id];
                        onCategoryChange(next);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                          : "bg-muted/40 border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {isSelected && <Check size={11} className="stroke-[3]" />}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          (String(formData.role).toUpperCase() === "DEAN" ||
            String(formData.role).toUpperCase() === "TEAMLEAD") && (
            <div className="md:col-span-3 pt-3 border-t border-border/60">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>
                  <strong className="text-foreground">
                    {String(formData.role).toUpperCase() === "DEAN"
                      ? "Dean"
                      : "Team Lead"}
                  </strong>{" "}
                  accounts automatically oversee and handle all subjects across the system.
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export const FacultyProfileForm = UserProfileForm;
