import { Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateUserPayload } from "@/features/users";

interface UserAccountFormProps {
  formData: CreateUserPayload;
  onChange: (field: keyof CreateUserPayload, value: string) => void;
}

export default function UserAccountForm({ formData, onChange }: UserAccountFormProps) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 font-sans text-foreground">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-muted text-muted-foreground rounded-xl">
          <Lock size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Account Credentials</h2>
          <p className="text-xs text-muted-foreground">Login email for platform authentication — a temporary password will be emailed automatically</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={14} className="text-muted-foreground" />
            Email Address <span className="text-primary">*</span>
          </Label>
          <Input
            type="email"
            required
            placeholder="e.g. jdoe@university.edu"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="h-11 bg-muted/40 border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}

export const FacultyAccountForm = UserAccountForm;
