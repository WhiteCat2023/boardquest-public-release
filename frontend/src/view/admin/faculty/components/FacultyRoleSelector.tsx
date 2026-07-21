import { Shield, CheckCircle2 } from "lucide-react";
import type { RoleOption, RoleType } from "../types";

interface FacultyRoleSelectorProps {
  selectedRole: RoleType;
  allowedRoles: RoleOption[];
  onSelectRole: (role: RoleType) => void;
}

export default function FacultyRoleSelector({
  selectedRole,
  allowedRoles,
  onSelectRole,
}: FacultyRoleSelectorProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
          <Shield size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Authority Role & Permissions</h2>
          <p className="text-xs text-slate-400">Select the access privileges granted to this faculty member</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {allowedRoles.map((roleOpt) => {
          const isSelected = selectedRole === roleOpt.value;
          return (
            <div
              key={roleOpt.value}
              onClick={() => onSelectRole(roleOpt.value)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-3 relative ${
                isSelected
                  ? "border-[#A70202] bg-red-50/30 shadow-xs"
                  : "border-slate-100 hover:border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Shield size={14} className={isSelected ? "text-[#A70202]" : "text-slate-400"} />
                  {roleOpt.label}
                </span>
                {isSelected && <CheckCircle2 size={16} className="text-[#A70202]" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{roleOpt.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
