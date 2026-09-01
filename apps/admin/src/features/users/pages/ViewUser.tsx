import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  IdCard,
  CheckCircle2,
  XCircle,
  UserCheck,
  Clock,
  Power,
  BookOpen,
  Edit3,
  Check,
  Building2,
  MapPin,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { UserRole } from "@/types/question";
import type { RoleType } from "@/features/users";
import {
  getRoleBadgeColor,
  isAllowedToManageRole,
  isUserOnline,
} from "@/features/users/utils/userUtils";
import {
  useUsers,
  useToggleUserStatus,
  useSubjects,
  useUpdateUserSubjects,
} from "@/features/users";
import { useLogs, type LogItem } from "@/features/logs";
import useRoleFlags from "@/hooks/useRoleFlags";

export default function ViewUser() {
  const { facultyId, userId } = useParams<{ facultyId?: string; userId?: string }>();
  const targetId = userId || facultyId;
  const navigate = useNavigate();
  const { currentUser, userRole } = useRoleFlags();
  const currentUserRole = userRole as RoleType;
  const currentUserId = currentUser?.id;

  const { data: userResponse, isLoading } = useUsers();
  const users = userResponse?.users || userResponse?.faculties || [];
  const { data: allSubjects = [], isLoading: isSubjectsLoading } =
    useSubjects();

  const toggleStatusMutation = useToggleUserStatus();
  const updateSubjectsMutation = useUpdateUserSubjects();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditCategoriesOpen, setIsEditCategoriesOpen] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  const member = users.find((f) => f.id === targetId);

  // Fetch account-specific activity logs by user email
  const { data: userLogs = [], isLoading: isLogsLoading } = useLogs({
    search: member?.email || "",
  });

  useEffect(() => {
    if (member) {
      const existingIds =
        member.handledSubjects?.map((c) => c.id) ||
        member.handledSubjectIds ||
        member.handledCategories?.map((c) => c.id) ||
        member.handledCategoryIds ||
        [];
      setSelectedSubjectIds(existingIds);
    }
  }, [member]);

  const formattedDate = member?.createdAt
    ? new Date(member.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const formatLastActive = (dateStr?: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 5) return "Active now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLogDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getLogLevelBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case "ERROR":
      case "FATAL":
        return (
          <Badge
            variant="outline"
            className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
          >
            {level}
          </Badge>
        );
      case "WARN":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
          >
            {level}
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
          >
            {level || "INFO"}
          </Badge>
        );
    }
  };

  const getRoleTitle = (role?: RoleType | string | number) => {
    const r = String(role || "").toUpperCase();
    switch (r) {
      case "SUPERADMIN":
        return "Super Administrator";
      case "DEAN":
        return "Dean";
      case "TEAMLEAD":
        return "Team Lead";
      case "TEACHER":
        return "Teacher / Instructor";
      case "REVIEWCENTER":
      case "EXTERNAL":
        return "Review Center Partner";
      default:
        return role ? String(role) : "User Member";
    }
  };

  const handleOpenConfirm = () => {
    if (!member) return;
    if (member.id === currentUserId) {
      toast.error("You cannot change your own account status.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleToggleConfirm = async () => {
    if (!member) return;
    const isCurrentlyActive =
      member.accountStatus === "ACTIVE" || member.accountStatus !== "DEACTIVATED";
    const nextStatus = !isCurrentlyActive;
    try {
      await toggleStatusMutation.mutateAsync({
        id: member.id,
        accountStatus: nextStatus ? "ACTIVE" : "DEACTIVATED",
        isActive: nextStatus,
      });
      toast.success(
        `${member.name}'s account was ${nextStatus ? "activated" : "deactivated"}.`,
      );
      setIsConfirmOpen(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to update account status.",
      );
    }
  };

  const handleSaveCategories = async () => {
    if (!member) return;
    try {
      await updateSubjectsMutation.mutateAsync({
        id: member.id,
        categoryIds: selectedSubjectIds,
        subjectIds: selectedSubjectIds,
      });
      setIsEditCategoriesOpen(false);
      toast.success("Handled subjects updated successfully");
    } catch {
      toast.error("Failed to update subjects");
    }
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-sans text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">
            Loading user profile...
          </p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center font-sans text-foreground">
        <div className="p-4 bg-muted text-muted-foreground rounded-full">
          <User size={36} />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          User Not Found
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          The user profile you are trying to view does not exist or
          may have been removed.
        </p>
        <Link to="/faculty-management">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 py-2 text-xs font-semibold cursor-pointer shadow-xs">
            Return to Users Directory
          </Button>
        </Link>
      </div>
    );
  }

  const activeMember = member!;

  const isAccountActive =
    activeMember.accountStatus === "ACTIVE" ||
    activeMember.accountStatus !== "DEACTIVATED";
  const isOnline = isUserOnline(activeMember.lastActiveAt);
  const canManage =
    activeMember.id !== currentUserId &&
    isAllowedToManageRole(currentUserRole, activeMember.role);
  const canManageCategories =
    String(currentUserRole) === "DEAN" ||
    String(currentUserRole) === "SUPERADMIN";

  const handledCategories = activeMember.handledSubjects || activeMember.handledCategories || [];
  const isExternal =
    String(activeMember.role) === "EXTERNAL" ||
    String(activeMember.role) === "REVIEWCENTER";

  return (
    <div className="flex-1 w-full min-h-0 overflow-y-auto font-sans bg-background text-foreground">
      <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8 pb-32 w-full max-w-5xl mx-auto">
        {/* Header & Back Navigation */}
        <div className="flex flex-col gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Link
              to="/faculty-management"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              Back to Users Directory
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
                <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                  {isExternal ? (
                    <Building2
                      size={22}
                      className="stroke-[2.5] text-purple-600 dark:text-purple-400"
                    />
                  ) : (
                    <UserCheck size={22} className="stroke-[2.5]" />
                  )}
                </div>
                {isExternal
                  ? "Partner Profile Details"
                  : "User Profile Details"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isExternal
                  ? "Complete external partner record and authorization profile"
                  : "Complete administrative record and authorization profile"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile Card */}
          <Card className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col items-center text-center gap-4 h-fit">
            <div className="relative">
              <Avatar className="h-20 w-20 rounded-2xl border-2 border-primary/20 bg-primary/10 text-primary shadow-xs">
                <AvatarFallback className="font-bold text-2xl uppercase bg-primary/10 text-primary rounded-2xl">
                  {activeMember.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {/* Online / Offline Dot */}
              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card transition-colors ${
                  isOnline
                    ? "bg-emerald-500 ring-2 ring-emerald-400/30"
                    : "bg-muted-foreground/40"
                }`}
                title={isOnline ? "Online Now" : "Offline"}
              />
            </div>

            <div className="flex flex-col gap-1 w-full">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {activeMember.name}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                {activeMember.email}
              </p>
            </div>

            {/* Vertical Stack of Badges */}
            <div className="flex flex-col items-center gap-2 w-full">
              <Badge
                variant="outline"
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase whitespace-nowrap ${getRoleBadgeColor(
                  activeMember.role,
                )}`}
              >
                <Shield size={12} />
                {getRoleTitle(activeMember.role)}
              </Badge>

              <Badge
                variant="outline"
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase whitespace-nowrap ${
                  isAccountActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                }`}
              >
                {isAccountActive ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <XCircle size={12} />
                )}
                {isAccountActive ? "Active Account" : "Deactivated"}
              </Badge>
            </div>

            <div className="w-full pt-4 border-t border-border flex flex-col gap-2.5">
              {canManage && (
                <>
                  <Button
                    onClick={handleOpenConfirm}
                    disabled={toggleStatusMutation.isPending}
                    className={`w-full h-10 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                      isAccountActive
                        ? "bg-muted text-foreground hover:bg-amber-500/10 hover:text-amber-600 border border-border"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600"
                    }`}
                  >
                    <Power size={14} />
                    {isAccountActive
                      ? "Deactivate Account"
                      : "Activate Account"}
                  </Button>
                </>
              )}
              <a
                href={`mailto:${activeMember.email}`}
                className="w-full h-10 rounded-xl bg-muted hover:bg-accent border border-border text-foreground font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Mail size={14} className="text-primary" />
                Send Email
              </a>
              {activeMember.phoneNumber && (
                <a
                  href={`tel:${activeMember.phoneNumber}`}
                  className="w-full h-10 rounded-xl bg-muted hover:bg-accent border border-border text-foreground font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone size={14} className="text-muted-foreground" />
                  Call {activeMember.phoneNumber}
                </a>
              )}
            </div>
          </Card>

          {/* Right Column: Detailed Cards */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Card 1: Account Information */}
            <Card className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="p-2 bg-muted text-muted-foreground rounded-xl">
                  <IdCard size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Account Information
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Official identity, credentials, and contact details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 p-3.5 bg-muted/40 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User size={12} /> First Name
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {activeMember.firstName || activeMember.name.split(" ")[0] || "N/A"}
                  </span>
                </div>

                {!isExternal && (
                  <div className="flex flex-col gap-1 p-3.5 bg-muted/40 rounded-2xl border border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User size={12} /> Middle Name
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {activeMember.middleName || "—"}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-1 p-3.5 bg-muted/40 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User size={12} /> Last Name
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {activeMember.lastName ||
                      (activeMember.name.split(" ").length > 1
                        ? activeMember.name.split(" ").slice(1).join(" ")
                        : "N/A")}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3.5 bg-muted/40 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <IdCard size={12} />{" "}
                    {isExternal ? "Partner / Representative ID" : "Employee ID"}
                  </span>
                  <span className="text-sm font-bold text-foreground font-mono">
                    {activeMember.employeeId || "N/A"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3.5 bg-muted/40 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Mail size={12} /> Email Address
                  </span>
                  <span className="text-sm font-bold text-foreground truncate">
                    {activeMember.email}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3.5 bg-muted/40 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Phone size={12} /> Phone Number
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {activeMember.phoneNumber || "N/A"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3.5 bg-muted/40 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar size={12} /> Date Registered
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {formattedDate}
                  </span>
                </div>

                {isExternal && (
                  <div className="flex flex-col gap-1 p-3.5 bg-muted/40 rounded-2xl border border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Building2
                        size={12}
                        className="text-purple-600 dark:text-purple-400"
                      />{" "}
                      Review Center / Org Name
                    </span>
                    <span className="text-sm font-bold text-foreground truncate">
                      {activeMember.companyName || "N/A"}
                    </span>
                  </div>
                )}

                {isExternal && (
                  <div className="flex flex-col gap-1 p-3.5 bg-muted/40 rounded-2xl border border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <MapPin size={12} /> Campus / Location
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {activeMember.location || "Philippines"}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Card 3: Handled Subjects (Internal User Only) */}
            {!isExternal && (
              <Card className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Handled Subjects / Categories
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Subject categories assigned to this teacher / faculty
                        member
                      </p>
                    </div>
                  </div>

                  {canManageCategories && (
                    <Button
                      onClick={() => setIsEditCategoriesOpen(true)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-border text-foreground hover:bg-indigo-500/10 hover:text-indigo-600 hover:border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 size={14} />
                      Edit Subjects
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {handledCategories.length > 0 ? (
                    handledCategories.map((cat: any) => (
                      <Badge
                        key={cat.id}
                        variant="outline"
                        className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-xs font-bold py-1 px-3 rounded-xl flex items-center gap-1.5"
                      >
                        <BookOpen size={12} />
                        {cat.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No subject categories assigned yet.
                      {canManageCategories &&
                        " Click 'Edit Subjects' to assign categories."}
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Card 2: Account Activity & Audit Logs */}
            <Card className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Account Activity & Audit Logs
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Session status and recorded audit trail for this user
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"}`}
                  />
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {isOnline ? "Online Now" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Activity Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/30 rounded-2xl border border-border/80 text-xs">
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-primary" />
                  <span className="text-muted-foreground font-medium">
                    Last Session Activity:
                  </span>
                  <span className="font-bold text-foreground">
                    {formatLastActive(activeMember.lastActiveAt)}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-muted-foreground">
                  {userLogs.length} event{userLogs.length === 1 ? "" : "s"}{" "}
                  recorded
                </div>
              </div>

              {/* Logs List Area */}
              {isLogsLoading ? (
                <div className="py-8 text-center text-muted-foreground text-xs font-semibold animate-pulse">
                  Loading account activity logs...
                </div>
              ) : userLogs.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2 bg-muted/20 rounded-2xl border border-border/60">
                  <ShieldAlert
                    size={28}
                    className="text-muted-foreground/40 mb-0.5"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      No Activity Logs Found
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      No system audit events or logins recorded for this user
                      yet.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {userLogs.slice(0, 10).map((log: LogItem) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2.5 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border transition-colors gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getLogLevelBadge(log.level)}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground leading-snug truncate max-w-[220px] sm:max-w-[280px]">
                            {log.action || log.message || "User Action"}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[220px] sm:max-w-[280px]">
                            {log.message && log.message !== log.action
                              ? log.message
                              : log.source || "System"}
                            {log.ipAddress ? ` • IP: ${log.ipAddress}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground shrink-0">
                        <Clock size={11} />
                        {formatLogDate(log.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Activate/Deactivate Confirmation AlertDialog */}
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground">
            <AlertDialogHeader className="flex flex-row items-start gap-3.5 text-left">
              <div
                className={`p-2.5 rounded-2xl border shrink-0 mt-0.5 ${
                  isAccountActive
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                }`}
              >
                {isAccountActive ? (
                  <XCircle size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}
              </div>
              <div className="space-y-1">
                <AlertDialogTitle className="text-base font-bold text-foreground">
                  {isAccountActive ? "Deactivate Account" : "Activate Account"}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to{" "}
                  {isAccountActive ? "deactivate" : "activate"}{" "}
                  <strong className="text-foreground">
                    {activeMember.name}
                  </strong>
                  ?{" "}
                  {isAccountActive
                    ? "This user will immediately lose access to all portals and systems."
                    : "This user will regain full access according to their role privileges."}
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4 gap-2">
              <AlertDialogCancel
                disabled={toggleStatusMutation.isPending}
                className="rounded-xl border-border hover:bg-accent text-foreground text-xs font-semibold h-9"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleToggleConfirm}
                disabled={toggleStatusMutation.isPending}
                className={`rounded-xl text-xs font-semibold h-9 shadow-xs text-white ${
                  isAccountActive
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {toggleStatusMutation.isPending
                  ? "Processing..."
                  : isAccountActive
                    ? "Yes, Deactivate"
                    : "Yes, Activate"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Handled Subjects Modal */}
        <AlertDialog
          open={isEditCategoriesOpen}
          onOpenChange={setIsEditCategoriesOpen}
        >
          <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-lg text-foreground">
            <AlertDialogHeader className="flex flex-row items-start gap-3.5 text-left">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
                <BookOpen size={20} />
              </div>
              <div className="space-y-1">
                <AlertDialogTitle className="text-base font-bold text-foreground">
                  Manage Handled Subjects
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  Select the licensure examination subject categories that{" "}
                  <strong className="text-foreground">
                    {activeMember.name}
                  </strong>{" "}
                  is authorized to author and manage questions for.
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>

            <div className="py-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 my-1">
              {isSubjectsLoading ? (
                <div className="py-6 text-center text-xs text-muted-foreground animate-pulse font-medium">
                  Loading available subjects...
                </div>
              ) : allSubjects.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  No subjects found in the curriculum.
                </p>
              ) : (
                allSubjects.map((cat: any) => {
                  const isSelected = selectedSubjectIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategorySelection(cat.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-500/10 border-indigo-500/40 text-foreground ring-1 ring-indigo-500/20"
                          : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-xl border ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          <BookOpen size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{cat.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {cat.code || "Licensure Subject"}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-border bg-background"
                        }`}
                      >
                        {isSelected && (
                          <Check size={12} className="stroke-[3]" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <AlertDialogFooter className="mt-4 gap-2">
              <AlertDialogCancel
                disabled={updateSubjectsMutation.isPending}
                className="rounded-xl border-border hover:bg-accent text-foreground text-xs font-semibold h-9"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSaveCategories}
                disabled={updateSubjectsMutation.isPending}
                className="rounded-xl text-xs font-semibold h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
              >
                {updateSubjectsMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export const ViewFacultyMember = ViewUser;
