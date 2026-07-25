import { useState } from "react";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateFacultyPayload } from "../types";

interface FacultyAccountFormProps {
  formData: CreateFacultyPayload;
  onChange: (field: keyof CreateFacultyPayload, value: string) => void;
}

export default function FacultyAccountForm({ formData, onChange }: FacultyAccountFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 font-sans text-foreground">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-muted text-muted-foreground rounded-xl">
          <Lock size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Account Credentials</h2>
          <p className="text-xs text-muted-foreground">Login username and password for platform authentication</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Username */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} className="text-muted-foreground" />
            Username <span className="text-primary">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="e.g. jdoe_admin"
            value={formData.username}
            onChange={(e) => onChange("username", e.target.value)}
            className="h-11 bg-muted/40 border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Lock size={14} className="text-muted-foreground" />
            Password <span className="text-primary">*</span>
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={(e) => onChange("password", e.target.value)}
              className="h-11 pr-10 bg-muted/40 border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground text-sm placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
