import { Card } from "@/components/ui/card";
import { getRoleTitle } from "@/features/users/utils/userUtils";
import type { UserMember } from "@/features/users/types/types";

interface UserPersonalDetailsTabProps {
  user: UserMember;
}

export default function UserPersonalDetailsTab({
  user,
}: UserPersonalDetailsTabProps) {
  const isExternal =
    String(user.role) === "EXTERNAL" || String(user.role) === "REVIEWCENTER";

  const isAccountActive =
    user.accountStatus === "ACTIVE" || user.accountStatus !== "DEACTIVATED";

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200">
      <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Personal information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 sm:gap-x-12">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">
                Full name
              </span>
              <span className="text-sm font-semibold text-foreground capitalize">
                {user.name}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">
                Phone number
              </span>
              <span className="text-sm font-semibold text-foreground font-mono">
                {user.phoneNumber || "—"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">
                {isExternal
                  ? "Partner / Representative ID"
                  : "Identity document"}
              </span>
              <span className="text-sm font-semibold text-foreground font-mono">
                {user.employeeId || "—"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">
                Location
              </span>
              <span className="text-sm font-semibold text-foreground">
                {user.location || "Philippines"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">
                Assigned role
              </span>
              <span className="text-sm font-semibold text-foreground">
                {getRoleTitle(user.role)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">
                Account status
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`size-2 rounded-full ${
                    isAccountActive ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="text-sm font-semibold text-foreground">
                  {isAccountActive ? "Active" : "Deactivated"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">
                Email
              </span>
              <span className="text-sm font-semibold text-foreground truncate">
                {user.email}
              </span>
            </div>

            {isExternal ? (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-normal text-muted-foreground">
                  Review Center / Org Name
                </span>
                <span className="text-sm font-semibold text-foreground truncate">
                  {user.companyName || "—"}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-normal text-muted-foreground">
                  Date registered
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formattedDate}
                </span>
              </div>
            )}

            {isExternal && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-normal text-muted-foreground">
                  Date registered
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formattedDate}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
