import { Power } from "lucide-react";
import { toast } from "sonner";
import { useToggleUserStatus } from "@/features/users/api/useUsers";
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

export interface TargetMemberToToggle {
  id: string;
  name: string;
  currentStatus?: boolean;
}

interface ToggleUserStatusDialogProps {
  targetMember: TargetMemberToToggle | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ToggleUserStatusDialog({
  targetMember,
  onClose,
  onSuccess,
}: ToggleUserStatusDialogProps) {
  const toggleStatusMutation = useToggleUserStatus();
  const isOpen = !!targetMember;
  const isTogglingActive = targetMember?.currentStatus !== false;

  const handleConfirmAction = () => {
    if (!targetMember) return;

    const nextStatus = !targetMember.currentStatus;
    toggleStatusMutation.mutate(
      {
        id: targetMember.id,
        accountStatus: nextStatus ? "ACTIVE" : "DEACTIVATED",
        isActive: nextStatus,
      },
      {
        onSuccess: () => {
          toast.success(
            `${targetMember.name}'s account was ${nextStatus ? "activated" : "deactivated"}.`,
          );
          onClose();
          onSuccess?.();
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to update account status.",
          );
          onClose();
        },
      },
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-card rounded-2xl p-5 border border-border shadow-xl max-w-md text-foreground font-sans">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Power
              className={
                isTogglingActive ? "text-amber-500" : "text-emerald-500"
              }
              size={18}
            />
            {isTogglingActive ? "Deactivate Account" : "Activate Account"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Are you sure you want to{" "}
            {isTogglingActive ? "deactivate" : "activate"}{" "}
            <strong className="text-foreground">
              {targetMember?.name || "this user"}
            </strong>
            's account?{" "}
            {isTogglingActive
              ? "Deactivated accounts will immediately lose login privileges."
              : "Active accounts will regain full login access."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-5 flex items-center justify-end gap-2">
          <AlertDialogCancel
            disabled={toggleStatusMutation.isPending}
            className="rounded-lg bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-3.5 py-1.5 cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirmAction();
            }}
            disabled={toggleStatusMutation.isPending}
            className={`rounded-lg text-white text-xs font-semibold px-3.5 py-1.5 cursor-pointer ${
              isTogglingActive
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {toggleStatusMutation.isPending
              ? "Processing..."
              : `Confirm ${isTogglingActive ? "Deactivation" : "Activation"}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
