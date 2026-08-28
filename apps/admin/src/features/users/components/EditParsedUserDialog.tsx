import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit3,
  User,
  Mail,
  Phone,
  IdCard,
  Building2,
  MapPin,
  Shield,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { ParsedUserRow } from "@/features/users";

interface EditParsedUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  row: ParsedUserRow | null;
  rowIndex: number | null;
  accountCategory?: "internal" | "external";
  onSave: (index: number, updatedRow: ParsedUserRow) => void;
}

export default function EditParsedUserDialog({
  isOpen,
  onClose,
  row,
  rowIndex,
  accountCategory = "internal",
  onSave,
}: EditParsedUserDialogProps) {
  const isExternal = accountCategory === "external";

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("TEACHER");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (row) {
      setFirstName(row.firstName || "");
      setMiddleName(row.middleName || "");
      setLastName(row.lastName || "");
      setEmployeeId(row.employeeId || "");
      setEmail(row.email || "");
      setPhoneNumber(row.phoneNumber || "");
      setRole(row.role ? String(row.role).toUpperCase() : "TEACHER");
      setCompanyName(row.companyName || "");
      setLocation(row.location || "Philippines");
      setValidationError("");
    }
  }, [row, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedFirst = firstName.trim();
    const trimmedMiddle = middleName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmpId = employeeId.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phoneNumber.trim();
    const trimmedCompany = companyName.trim();
    const trimmedLocation = location.trim() || "Philippines";

    const fullName = [trimmedFirst, trimmedMiddle, trimmedLast]
      .filter(Boolean)
      .join(" ")
      .trim();

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    let isValid = true;
    let errorMsg = "";

    if (isExternal) {
      if (!trimmedCompany) {
        isValid = false;
        errorMsg = "Missing Organization Name";
      } else if (!trimmedFirst && !trimmedLast && !fullName) {
        isValid = false;
        errorMsg = "Missing Representative Name";
      } else if (!trimmedEmpId) {
        isValid = false;
        errorMsg = "Missing Partner ID";
      } else if (!trimmedEmail || !isValidEmail) {
        isValid = false;
        errorMsg = "Invalid Email Address";
      } else if (!trimmedPhone) {
        isValid = false;
        errorMsg = "Missing Phone Number";
      }
    } else {
      if (!trimmedFirst && !trimmedLast && !fullName) {
        isValid = false;
        errorMsg = "Missing Name";
      } else if (!trimmedEmpId) {
        isValid = false;
        errorMsg = "Missing Employee ID";
      } else if (!trimmedEmail || !isValidEmail) {
        isValid = false;
        errorMsg = "Invalid Email Address";
      } else if (!trimmedPhone) {
        isValid = false;
        errorMsg = "Missing Phone Number";
      }
    }

    if (rowIndex === null) return;

    const updatedRow: ParsedUserRow = {
      name: fullName || `${trimmedFirst} ${trimmedLast}`.trim(),
      firstName: trimmedFirst || undefined,
      middleName: trimmedMiddle || undefined,
      lastName: trimmedLast || undefined,
      employeeId: trimmedEmpId || undefined,
      email: trimmedEmail,
      phoneNumber: trimmedPhone || undefined,
      role: isExternal ? "EXTERNAL" : role,
      companyName: isExternal ? trimmedCompany : undefined,
      location: isExternal ? trimmedLocation : undefined,
      isValid,
      validationError: errorMsg,
    };

    onSave(rowIndex, updatedRow);
    onClose();
  };

  if (!row || rowIndex === null) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-2xl p-6 border border-border shadow-2xl max-w-lg flex flex-col font-sans text-foreground">
        <DialogHeader className="text-left pb-2 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isExternal
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                  : "bg-primary/10 text-primary border-primary/20"
              }`}
            >
              <Edit3 size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Edit Extracted Entry #{rowIndex + 1}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Update account details before completing bulk import.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          {validationError && (
            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{validationError}</span>
            </div>
          )}

          {isExternal ? (
            /* External Organization Fields */
            <div className="space-y-3.5">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 size={12} className="text-purple-600 dark:text-purple-400" />
                  Organization / Review Center <span className="text-primary">*</span>
                </Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. TopRank Review Academy"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
                />
              </div>

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
                    onChange={(e) => setFirstName(e.target.value)}
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
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
                  />
                </div>
              </div>

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
                    onChange={(e) => setEmployeeId(e.target.value)}
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
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
                  />
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
                    placeholder="partner@review.edu.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Internal User Fields */
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
                    onChange={(e) => setFirstName(e.target.value)}
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
                    onChange={(e) => setMiddleName(e.target.value)}
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
                    onChange={(e) => setLastName(e.target.value)}
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
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Shield size={12} /> System Role <span className="text-primary">*</span>
                  </Label>
                  <Select value={role} onValueChange={setRole}>
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
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between pt-3 border-t border-border/70 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs rounded-xl border-border hover:bg-accent font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`text-xs rounded-xl font-semibold px-4 shadow-xs ${
                isExternal
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              <CheckCircle2 size={13} className="mr-1" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
