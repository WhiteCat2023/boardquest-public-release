import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { Power, Trash2 } from "lucide-react";
import type { FacultyMember, RoleType } from "./types";
import { getAllowedRolesToCreate } from "./utils/facultyUtils";
import { useFaculties, useDeleteFaculty, useToggleFacultyStatus } from "./hooks/useFaculty";
import FacultyHeader from "./components/FacultyHeader";
import FacultyTable from "./components/FacultyTable";
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

export default function FacultyManagement() {
  const { auth } = useAuth();

  const currentUserRole = (auth as any)?.data?.user?.role as RoleType;
  const currentUserId = (auth as any)?.data?.user?.id;

  const { data: faculties = [], isLoading: isFacultiesLoading } = useFaculties();
  const deleteMutation = useDeleteFaculty();
  const toggleStatusMutation = useToggleFacultyStatus();

  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "toggle" | "delete";
    memberId: string;
    memberName: string;
    memberRole?: RoleType;
    currentStatus?: boolean;
  }>({
    isOpen: false,
    type: "toggle",
    memberId: "",
    memberName: "",
  });

  const handleOpenToggleConfirm = (id: string, currentStatus: boolean, name: string) => {
    if (id === currentUserId) {
      toast.error("You cannot change your own account status.");
      return;
    }
    setConfirmDialog({
      isOpen: true,
      type: "toggle",
      memberId: id,
      memberName: name,
      currentStatus,
    });
  };

  const handleOpenDeleteConfirm = (id: string, memberName: string, memberRole: RoleType) => {
    if (id === currentUserId) {
      toast.error("You cannot delete your own account.");
      return;
    }
    setConfirmDialog({
      isOpen: true,
      type: "delete",
      memberId: id,
      memberName: memberName,
      memberRole,
    });
  };

  const handleConfirmAction = () => {
    const { type, memberId, memberName, currentStatus } = confirmDialog;
    if (!memberId) return;

    if (type === "toggle") {
      const nextStatus = !currentStatus;
      toggleStatusMutation.mutate(
        { id: memberId, isActive: nextStatus },
        {
          onSuccess: () => {
            toast.success(`${memberName}'s account was ${nextStatus ? "activated" : "deactivated"}.`);
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update account status.");
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          },
        }
      );
    } else if (type === "delete") {
      deleteMutation.mutate(memberId, {
        onSuccess: () => {
          toast.success("Faculty account deleted successfully.");
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to delete faculty member.");
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
      });
    }
  };

  const canAddFaculty = getAllowedRolesToCreate(currentUserRole).length > 0;
  const isTogglingActive = confirmDialog.currentStatus !== false;

  return (
    <div className="flex flex-col gap-6 p-8 w-full min-h-full font-sans bg-slate-50/50">
      <FacultyHeader canAddFaculty={canAddFaculty} />
      <FacultyTable
        faculties={faculties}
        isLoading={isFacultiesLoading}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
        onToggleStatus={handleOpenToggleConfirm}
        onDelete={handleOpenDeleteConfirm}
      />

      {/* Shadcn UI Confirmation AlertDialog */}
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {confirmDialog.type === "toggle" ? (
                <>
                  <Power className={isTogglingActive ? "text-amber-600" : "text-emerald-600"} size={20} />
                  {isTogglingActive ? "Deactivate Account" : "Activate Account"}
                </>
              ) : (
                <>
                  <Trash2 className="text-red-600" size={20} />
                  Delete Account
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 mt-2 leading-relaxed">
              {confirmDialog.type === "toggle" ? (
                <>
                  Are you sure you want to {isTogglingActive ? "deactivate" : "activate"}{" "}
                  <strong className="text-slate-800">{confirmDialog.memberName}</strong>'s account?{" "}
                  {isTogglingActive
                    ? "Deactivated accounts will immediately lose login privileges."
                    : "Active accounts will regain full login access."}
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-slate-800">{confirmDialog.memberName}</strong> ({confirmDialog.memberRole})? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 text-xs font-semibold px-4 py-2 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={`rounded-xl text-white text-xs font-semibold px-4 py-2 cursor-pointer ${
                confirmDialog.type === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : isTogglingActive
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {confirmDialog.type === "delete"
                ? "Delete Account"
                : `Confirm ${isTogglingActive ? "Deactivation" : "Activation"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
