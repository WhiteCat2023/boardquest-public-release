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
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
          <Lock size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Account Credentials</h2>
          <p className="text-xs text-slate-400">Login username and password for platform authentication</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Username */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} className="text-slate-400" />
            Username <span className="text-[#A70202]">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="e.g. jdoe_admin"
            value={formData.username}
            onChange={(e) => onChange("username", e.target.value)}
            className="h-11 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Lock size={14} className="text-slate-400" />
            Password <span className="text-[#A70202]">*</span>
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={(e) => onChange("password", e.target.value)}
              className="h-11 pr-10 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
