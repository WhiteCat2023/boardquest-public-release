import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  XCircle,
  Power,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { showFeedback } from "@/components/modal";
import ToggleUserStatusDialog from "../ToggleUserStatusDialog";
import {
  getRoleBadgeColor,
  getRoleTitle,
  isAllowedToManageRole,
  isUserOnline,
} from "@/features/users/utils/userUtils";
import type { UserMember, RoleType } from "@/features/users/types/types";

interface ViewUserHeaderProps {
  user: UserMember;
  currentUserId?: string;
  currentUserRole?: RoleType;
}

export default function ViewUserHeader({
  user,
  currentUserId,
  currentUserRole,
}: ViewUserHeaderProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isAccountActive =
    user.accountStatus === "ACTIVE" || user.accountStatus !== "DEACTIVATED";
  const isOnline = isUserOnline(user.lastActiveAt);
  const canManage =
    user.id !== currentUserId &&
    currentUserRole &&
    isAllowedToManageRole(currentUserRole, user.role);

  const isExternal =
    String(user.role) === "EXTERNAL" || String(user.role) === "REVIEWCENTER";
  const initials = (user.name || "U").slice(0, 2).toUpperCase();

  const handleOpenConfirm = () => {
    if (user.id === currentUserId) {
      showFeedback.error("You cannot change your own account status.");
      return;
    }
    setIsConfirmOpen(true);
  };

  return (
    <>
      {/* Back navigation button */}
      <Link
        to="/faculty-management"
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={14} />
        <span>Back to Users Directory</span>
      </Link>

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
        {/* Left Side: Avatar, Name, Role Badges & Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative shrink-0 group self-start">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-border shadow-xs bg-muted text-foreground overflow-hidden">
              {user.avatarUrl ? (
                <AvatarImage
                  src={user.avatarUrl}
                  alt={user.name}
                  className="object-cover size-full"
                />
              ) : null}
              <AvatarFallback className="font-black text-xl sm:text-2xl bg-primary/10 text-primary uppercase rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <span
              className={`absolute -bottom-1 -right-1 size-3.5 sm:size-4 rounded-full border-2 border-card ring-2 transition-colors ${
                isOnline
                  ? "bg-emerald-500 ring-emerald-400/20"
                  : "bg-muted-foreground/40 ring-transparent"
              }`}
              title={isOnline ? "Online Now" : "Offline"}
            />
          </div>

          <div className="space-y-1.5 min-w-0">
            {/* Name + Role & Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight capitalize truncate">
                {user.name}
              </h1>
              <Badge
                variant="outline"
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase whitespace-nowrap ${getRoleBadgeColor(
                  user.role,
                )}`}
              >
                <Shield size={11} />
                {getRoleTitle(user.role)}
              </Badge>
              <Badge
                variant="outline"
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase whitespace-nowrap ${
                  isAccountActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                }`}
              >
                {isAccountActive ? (
                  <CheckCircle2 size={11} />
                ) : (
                  <XCircle size={11} />
                )}
                {isAccountActive ? "Active" : "Deactivated"}
              </Badge>
            </div>

            {/* Subtitle: Email, Review Center / Org if external, Location */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="truncate">{user.email}</span>
              {isExternal && user.companyName && (
                <>
                  <span>•</span>
                  <span className="truncate">{user.companyName}</span>
                </>
              )}
              {user.location && (
                <>
                  <span>•</span>
                  <span className="truncate">{user.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {canManage && (
            <Button
              onClick={handleOpenConfirm}
              variant={isAccountActive ? "outline" : "default"}
              className={`h-9 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isAccountActive
                  ? "border-border hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <Power size={13} />
              {isAccountActive ? "Deactivate Account" : "Activate Account"}
            </Button>
          )}
          <a
            href={`mailto:${user.email}`}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-card hover:bg-accent border border-border text-foreground font-semibold text-xs transition-colors shadow-xs"
          >
            <Mail size={13} className="text-primary" />
            <span>Send Email</span>
          </a>
          {user.phoneNumber && (
            <a
              href={`tel:${user.phoneNumber}`}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-card hover:bg-accent border border-border text-foreground font-semibold text-xs transition-colors shadow-xs"
            >
              <Phone size={13} className="text-muted-foreground" />
              <span>Call</span>
            </a>
          )}
        </div>
      </div>

      {/* Account Status Confirmation Dialog */}
      <ToggleUserStatusDialog
        targetMember={
          isConfirmOpen
            ? {
                id: user.id,
                name: user.name,
                currentStatus: isAccountActive,
                role: user.role as string,
                email: user.email,
              }
            : null
        }
        onClose={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
