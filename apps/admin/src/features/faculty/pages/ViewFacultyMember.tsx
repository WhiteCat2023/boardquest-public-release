import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
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
  Info,
  Lock,
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
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import type { RoleType } from "@/features/faculty";
import {
  getRoleBadgeColor,
  isAllowedToManageRole,
  isUserOnline,
} from "@/features/faculty/utils/facultyUtils";
import {
  useFaculties,
  useToggleFacultyStatus,
  useCategories,
  useUpdateFacultyCategories,
} from "@/features/faculty";

import useRoleFlags from "@/hooks/useRoleFlags";

export default function ViewFacultyMember() {
  const { facultyId } = useParams<{ facultyId: string }>();
  const navigate = useNavigate();
  const { currentUser, userRole } = useRoleFlags();
  const currentUserRole = userRole as RoleType;
  const currentUserId = currentUser?.id;

  const { data: facultyResponse, isLoading } = useFaculties();
  const faculties = facultyResponse?.faculties ?? [];
  const { data: allCategories = [], isLoading: isCategoriesLoading } =
    useCategories();

  const toggleStatusMutation = useToggleFacultyStatus();
  const updateCategoriesMutation = useUpdateFacultyCategories();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditCategoriesOpen, setIsEditCategoriesOpen] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const member = faculties.find((f) => f.id === facultyId);

  useEffect(() => {
    if (member) {
      const existingIds =
        member.handledCategories?.map((c) => c.id) ||
        member.handledCategoryIds ||
        [];
      setSelectedCategoryIds(existingIds);
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

  const getRoleTitle = (role?: RoleType) => {
    switch (role) {
      case "SUPERADMIN":
        return "Super Administrator";
      case "ADMIN":
        return "Administrator";
      case "TEAMLEAD":
        return "Co-Admin (Team Lead)";
      case "TEACHER":
        return "Teacher / Instructor";
      default:
        return role || "Faculty Member";
    }
  };

  const getRoleDescription = (role?: RoleType) => {
    switch (role) {
      case "SUPERADMIN":
        return "Full system control, department creation, and administrative access.";
      case "ADMIN":
        return "Department management, faculty member administration, and curriculum oversight.";
      case "TEAMLEAD":
        return "Department co-administration, curriculum reviewing, and teacher coordination.";
      case "TEACHER":
        return "Question bank creation, test item authoring, and personal question library management.";
      default:
        return "Standard system user privileges.";
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

  const handleConfirmToggleStatus = () => {
    if (!member) return;
    const currentStatus = member.isActive !== false;
    const nextStatus = !currentStatus;

    toggleStatusMutation.mutate(
      { id: member.id, isActive: nextStatus },
      {
        onSuccess: () => {
          toast.success(
            `${member.name}'s account was ${nextStatus ? "activated" : "deactivated"}.`,
          );
          setIsConfirmOpen(false);
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to update account status.",
          );
          setIsConfirmOpen(false);
        },
      },
    );
  };

  const handleSaveCategories = () => {
    if (!member) return;
    updateCategoriesMutation.mutate(
      { id: member.id, categoryIds: selectedCategoryIds },
      {
        onSuccess: () => {
          toast.success(`Handled subjects updated for ${member.name}.`);
          setIsEditCategoriesOpen(false);
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to update handled subjects.",
          );
        },
      },
    );
  };

  if (!member && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center font-sans text-foreground">
        <div className="p-4 bg-muted text-muted-foreground rounded-full">
          <User size={36} />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          Faculty Member Not Found
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          The faculty member profile you are trying to view does not exist or
          may have been removed.
        </p>
        <Link to="/faculty-management">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 py-2 text-xs font-semibold cursor-pointer shadow-xs">
            Return to Faculty Directory
          </Button>
        </Link>
      </div>
    );
  }

  const activeMember = member || ({
    id: "placeholder",
    name: "Loading Faculty Member",
    email: "loading.faculty@university.edu",
    role: "TEACHER",
    isActive: true,
    department: { name: "Department Name" },
    handledCategories: [{ id: "1", name: "Category Name" }],
  } as any);

  const isAccountActive = activeMember.isActive !== false;
  const isOnline = isUserOnline(activeMember.lastActiveAt, activeMember.isActive);
  const canManage =
    activeMember.id !== currentUserId &&
    isAllowedToManageRole(currentUserRole, activeMember.role || "TEACHER");
  const canManageCategories =
    currentUserRole === "ADMIN" || currentUserRole === "SUPERADMIN";

  const handledCategories = activeMember.handledCategories || [];

  return (
    <phantom-ui loading={isLoading}>
      <div className="flex flex-col gap-6 p-6 md:p-8 w-full min-h-full font-sans bg-background text-foreground max-w-5xl mx-auto">
      {/* Header & Back Navigation */}
      <div className="flex flex-col gap-4 sticky top-0 bg-background/95 backdrop-blur-md pb-4 pt-4 -mt-4 z-10 border-b border-border">
        <div className="flex items-center gap-2">
          <Link
            to="/faculty-management"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Faculty Directory
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                <UserCheck size={22} className="stroke-[2.5]" />
              </div>
              Faculty Profile Details
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complete administrative record and authorization profile
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
              @{activeMember.username}
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
                  {isAccountActive ? "Deactivate Account" : "Activate Account"}
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
          {/* Card 1: Information Overview */}
          <Card className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="p-2 bg-muted text-muted-foreground rounded-xl">
                <IdCard size={18} />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Account & Status Overview
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 p-3.5 bg-muted/40 rounded-2xl border border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <IdCard size={12} /> Employee ID
                </span>
                <span className="text-sm font-bold text-foreground">
                  {activeMember.employeeId || "N/A"}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 bg-muted/40 rounded-2xl border border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User size={12} /> System Username
                </span>
                <span className="text-sm font-bold text-foreground">
                  @{activeMember.username}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 bg-muted/40 rounded-2xl border border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock size={12} /> Last Active
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatLastActive(activeMember.lastActiveAt)}
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

              <div className="flex flex-col gap-1 p-3.5 bg-muted/40 rounded-2xl border border-border sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Briefcase size={12} /> Department
                </span>
                <span className="text-sm font-bold text-foreground capitalize">
                  {activeMember.department?.name || "General Academic"}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2: Handled Subjects / Categories */}
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
                    Subject categories assigned to this teacher / faculty member
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

          {/* Card 3: Permissions & Role Scope */}
          <Card className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="p-2 bg-muted text-muted-foreground rounded-xl">
                <Lock size={18} />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Role Privilege & Scope
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Shield size={16} className="text-primary" />
                  {getRoleTitle(activeMember.role)}
                </span>
                <Badge
                  variant="outline"
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    isAccountActive
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
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
              <p className="text-xs text-muted-foreground leading-relaxed">
                {getRoleDescription(activeMember.role)}
              </p>
            </div>
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
              <Power size={20} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col gap-1">
              <AlertDialogTitle className="text-lg font-bold text-foreground leading-snug">
                {isAccountActive ? "Deactivate Account" : "Activate Account"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to{" "}
                {isAccountActive ? "deactivate" : "activate"}{" "}
                <strong className="text-foreground">{activeMember.name}</strong>'s
                account?{" "}
                {isAccountActive
                  ? "Deactivated accounts will immediately lose login privileges."
                  : "Active accounts will regain full login access."}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <AlertDialogCancel className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 py-2 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmToggleStatus}
              className={`rounded-xl text-white text-xs font-semibold px-4 py-2 cursor-pointer ${
                isAccountActive
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              Confirm {isAccountActive ? "Deactivation" : "Activation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Handled Categories Modal for Admin / SuperAdmin */}
      {canManageCategories && (
        <AlertDialog
          open={isEditCategoriesOpen}
          onOpenChange={setIsEditCategoriesOpen}
        >
          <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-lg text-foreground">
            <AlertDialogHeader className="text-left space-y-3">
              <div className="flex flex-row items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20 shrink-0">
                  <BookOpen size={20} className="stroke-[2.5]" />
                </div>
                <AlertDialogTitle className="text-lg font-bold text-foreground leading-snug">
                  Manage Handled Subjects for {activeMember.name}
                </AlertDialogTitle>
              </div>

              <AlertDialogDescription asChild>
                <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
                  <Info size={15} className="text-indigo-500 shrink-0 mt-0.5 stroke-[2.2]" />
                  <span>
                    Select or unselect the subject categories assigned to{" "}
                    <strong className="text-foreground font-bold">{activeMember.name}</strong>. Only{" "}
                    <strong className="text-foreground font-semibold">Administrators</strong> and{" "}
                    <strong className="text-foreground font-semibold">Super Administrators</strong> can modify subject assignments.
                  </span>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4 flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {isCategoriesLoading ? (
                <div className="h-10 bg-muted rounded-xl animate-pulse" />
              ) : allCategories.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No subject categories available in system.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat: any) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryIds((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== cat.id)
                              : [...prev, cat.id],
                          );
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-muted text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        {isSelected && (
                          <Check size={12} className="stroke-[3]" />
                        )}
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <AlertDialogFooter className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-4">
              <AlertDialogCancel className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 py-2 cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSaveCategories}
                disabled={updateCategoriesMutation.isPending}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 py-2 cursor-pointer shadow-xs"
              >
                {updateCategoriesMutation.isPending
                  ? "Saving..."
                  : "Save Subject Assignments"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      </div>
    </phantom-ui>
  );
}
