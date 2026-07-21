import { useState } from "react";
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
  Lock,
  UserCheck,
  Clock,
  Power,
  Trash2,
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
import type { RoleType } from "./types";
import { getRoleBadgeColor, isAllowedToManageRole, isUserOnline } from "./utils/facultyUtils";
import { useFaculties, useToggleFacultyStatus, useDeleteFaculty } from "./hooks/useFaculty";

export default function ViewFacultyMember() {
  const { facultyId } = useParams<{ facultyId: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { data: faculties = [], isLoading } = useFaculties();
  const toggleStatusMutation = useToggleFacultyStatus();
  const deleteMutation = useDeleteFaculty();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const currentUserRole = (auth as any)?.data?.user?.role as RoleType;
  const currentUserId = (auth as any)?.data?.user?.id;

  const member = faculties.find((f) => f.id === facultyId);

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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
          toast.success(`${member.name}'s account was ${nextStatus ? "activated" : "deactivated"}.`);
          setIsConfirmOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to update account status.");
          setIsConfirmOpen(false);
        },
      }
    );
  };

  const handleOpenDeleteConfirm = () => {
    if (!member) return;
    if (member.id === currentUserId) {
      toast.error("You cannot delete your own account.");
      return;
    }
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!member) return;
    deleteMutation.mutate(member.id, {
      onSuccess: () => {
        toast.success("Faculty member deleted successfully.");
        setIsDeleteConfirmOpen(false);
        navigate("/faculty-management");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to delete faculty member.");
        setIsDeleteConfirmOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin border-3 border-[#A70202] border-t-transparent rounded-full w-8 h-8"></div>
        <p className="text-sm font-medium text-slate-400">Loading faculty profile details...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
        <div className="p-4 bg-slate-100 text-slate-400 rounded-full">
          <User size={36} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Faculty Member Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          The faculty member profile you are trying to view does not exist or may have been removed.
        </p>
        <Link to="/faculty-management">
          <Button className="bg-[#A70202] text-white hover:bg-[#8e0202] rounded-xl px-5 py-2 text-xs font-semibold cursor-pointer">
            Return to Faculty Directory
          </Button>
        </Link>
      </div>
    );
  }

  const isAccountActive = member.isActive !== false;
  const isOnline = isUserOnline(member.lastActiveAt, member.isActive);
  const canManage = member.id !== currentUserId && isAllowedToManageRole(currentUserRole, member.role);

  return (
    <div className="flex flex-col gap-6 p-8 w-full min-h-full font-sans bg-slate-50/50 max-w-5xl mx-auto">
      {/* Header & Back Navigation */}
      <div className="flex flex-col gap-4 sticky top-0 bg-slate-50/95 backdrop-blur-md pb-4 pt-4 -mt-4 z-10 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Link
            to="/faculty-management"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#A70202] transition-colors group"
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
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
              <div className="p-2.5 bg-red-50 text-[#A70202] rounded-2xl border border-red-100">
                <UserCheck size={22} className="stroke-[2.5]" />
              </div>
              Faculty Profile Details
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Complete administrative record and authorization profile
            </p>
          </div>

          {canManage && (
            <Button
              onClick={handleOpenDeleteConfirm}
              variant="destructive"
              className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-none"
            >
              <Trash2 size={15} />
              Delete Account
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <Card className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center gap-4 h-fit">
          <div className="relative">
            <Avatar className="h-20 w-20 rounded-2xl border-2 border-red-100 bg-red-50 text-[#A70202] shadow-xs">
              <AvatarFallback className="font-bold text-2xl uppercase bg-red-50 text-[#A70202] rounded-2xl">
                {member.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {/* Online / Offline Dot */}
            <span
              className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white transition-colors ${
                isOnline
                  ? "bg-emerald-500 ring-2 ring-emerald-400/30"
                  : "bg-slate-300"
              }`}
              title={isOnline ? "Online Now" : "Offline"}
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              {member.name}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              @{member.username}
            </p>
          </div>

          {/* Vertical Stack of Badges */}
          <div className="flex flex-col items-center gap-2 w-full">
            <Badge
              variant="outline"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase whitespace-nowrap ${getRoleBadgeColor(
                member.role
              )}`}
            >
              <Shield size={12} />
              {getRoleTitle(member.role)}
            </Badge>

            <Badge
              variant="outline"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase whitespace-nowrap ${
                isAccountActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {isAccountActive ? (
                <CheckCircle2 size={12} />
              ) : (
                <XCircle size={12} />
              )}
              {isAccountActive ? "Active Account" : "Deactivated"}
            </Badge>

            {/* <Badge
              variant="outline"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase whitespace-nowrap ${
                isOnline
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
              />
              {isOnline ? "Online" : "Offline"}
            </Badge> */}
          </div>

          <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            {canManage && (
              <>
                <Button
                  onClick={handleOpenConfirm}
                  disabled={toggleStatusMutation.isPending}
                  className={`w-full h-10 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                    isAccountActive
                      ? "bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border border-slate-200"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600"
                  }`}
                >
                  <Power size={14} />
                  {isAccountActive ? "Deactivate Account" : "Activate Account"}
                </Button>

                <Button
                  onClick={handleOpenDeleteConfirm}
                  disabled={deleteMutation.isPending}
                  variant="destructive"
                  className="w-full h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-none"
                >
                  <Trash2 size={14} />
                  Delete Member Account
                </Button>
              </>
            )}
            <a
              href={`mailto:${member.email}`}
              className="w-full h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors flex items-center justify-center"
            >
              <Mail size={14} className="text-[#A70202]" />
              Send Email
            </a>
            {member.phoneNumber && (
              <a
                href={`tel:${member.phoneNumber}`}
                className="w-full h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors flex items-center justify-center"
              >
                <Phone size={14} className="text-slate-500" />
                Call {member.phoneNumber}
              </a>
            )}
          </div>
        </Card>

        {/* Right Column: Detailed Cards */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Card 1: Information Overview */}
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                <IdCard size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Account & Status Overview
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 p-3.5 bg-slate-50/60 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <IdCard size={12} /> Employee ID
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {member.employeeId || "N/A"}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 bg-slate-50/60 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User size={12} /> System Username
                </span>
                <span className="text-sm font-bold text-slate-800">
                  @{member.username}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 bg-slate-50/60 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock size={12} /> Last Active
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {formatLastActive(member.lastActiveAt)}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 bg-slate-50/60 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar size={12} /> Date Registered
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {formattedDate}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 bg-slate-50/60 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Mail size={12} /> Email Address
                </span>
                <span className="text-sm font-bold text-slate-800 truncate">
                  {member.email}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 bg-slate-50/60 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Phone size={12} /> Phone Number
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {member.phoneNumber || "N/A"}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 bg-slate-50/60 rounded-2xl border border-slate-100 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Briefcase size={12} /> Department
                </span>
                <span className="text-sm font-bold text-slate-800 capitalize">
                  {member.department?.name || "General Academic"}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2: Permissions & Role Scope */}
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                <Lock size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Role Privilege & Scope
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/30 border border-red-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Shield size={16} className="text-[#A70202]" />
                  {getRoleTitle(member.role)}
                </span>
                <Badge
                  variant="outline"
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    isAccountActive
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : "text-amber-700 bg-amber-50 border-amber-200"
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
              <p className="text-xs text-slate-600 leading-relaxed">
                {getRoleDescription(member.role)}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Activate/Deactivate Confirmation AlertDialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Power className={isAccountActive ? "text-amber-600" : "text-emerald-600"} size={20} />
              {isAccountActive ? "Deactivate Account" : "Activate Account"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to {isAccountActive ? "deactivate" : "activate"}{" "}
              <strong className="text-slate-800">{member.name}</strong>'s account?{" "}
              {isAccountActive
                ? "Deactivated accounts will immediately lose login privileges."
                : "Active accounts will regain full login access."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 text-xs font-semibold px-4 py-2 cursor-pointer">
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

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Trash2 className="text-red-600" size={20} />
              Delete Faculty Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-800">{member.name}</strong> ({member.role})? This action cannot be undone and will permanently remove their profile and access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 text-xs font-semibold px-4 py-2 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 cursor-pointer"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
