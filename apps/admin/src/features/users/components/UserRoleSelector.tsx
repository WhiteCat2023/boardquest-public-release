import { Shield, CheckCircle2 } from "lucide-react";
import type { RoleOption, RoleType } from "@/features/users";

interface UserRoleSelectorProps {
  selectedRole: RoleType;
  allowedRoles: RoleOption[];
  onSelectRole: (role: RoleType) => void;
}

export default function UserRoleSelector({
  selectedRole,
  allowedRoles,
  onSelectRole,
}: UserRoleSelectorProps) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 font-sans text-foreground">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-muted text-muted-foreground rounded-xl">
          <Shield size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Authority Role & Permissions</h2>
          <p className="text-xs text-muted-foreground">Select the access privileges granted to this user</p>
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
                  ? "border-primary bg-primary/10 shadow-xs"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Shield size={14} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                  {roleOpt.label}
                </span>
                {isSelected && <CheckCircle2 size={16} className="text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{roleOpt.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const FacultyRoleSelector = UserRoleSelector;
