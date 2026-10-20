import { Power, AlertTriangle, ShieldAlert } from "lucide-react";
import { showFeedback } from "@/components/modal";
import { useToggleUserStatus, useActiveDean } from "@/features/users/api/useUsers";
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
  role?: string;
  email?: string;
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
  const isActivating = !isTogglingActive;
  const isTargetDean = String(targetMember?.role || "").toUpperCase() === "DEAN";

  // Check if there is currently an active Dean in the system
  const { data: activeDean, isLoading: isLoadingDean } = useActiveDean(
    isOpen && isActivating && isTargetDean,
  );

  const hasActiveDeanConflict = Boolean(
    isActivating &&
      isTargetDean &&
      activeDean &&
      activeDean.id !== targetMember?.id,
  );

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
        onSuccess: (res: any) => {
          const replaced = res?.data?.data?.user?.replacedDean || activeDean;
          if (hasActiveDeanConflict && replaced) {
            showFeedback.success(
              `${targetMember.name} is now the active Dean. ${replaced.name} has been deactivated.`,
            );
          } else {
            showFeedback.success(
              `${targetMember.name}'s account was ${nextStatus ? "activated" : "deactivated"}.`,
            );
          }
          onClose();
          onSuccess?.();
        },
        onError: (err: any) => {
          showFeedback.error(
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
            {hasActiveDeanConflict ? (
              <ShieldAlert className="text-amber-500" size={20} />
            ) : (
              <Power
                className={
                  isTogglingActive ? "text-amber-500" : "text-emerald-500"
                }
                size={18}
              />
            )}
            {hasActiveDeanConflict
              ? "Active Dean Replacement Warning"
              : isTogglingActive
                ? "Deactivate Account"
                : "Activate Account"}
          </AlertDialogTitle>

          {hasActiveDeanConflict && activeDean ? (
            <div className="flex flex-col gap-2.5 mt-2">
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex flex-col gap-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                  <AlertTriangle size={15} className="shrink-0 text-amber-600" />
                  <span>Currently Active Dean:</span>
                </div>
                <p className="font-semibold text-[13px] text-foreground">
                  {activeDean.name}{" "}
                  <span className="font-normal text-muted-foreground text-xs">
                    ({activeDean.email})
                  </span>
                </p>
                <p className="leading-relaxed text-[11px] text-muted-foreground">
                  The institution permits only <strong>one active Dean</strong> at a time.
                </p>
              </div>

              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Activating <strong className="text-foreground">{targetMember?.name}</strong> will automatically{" "}
                <strong className="text-amber-600 dark:text-amber-400">deactivate {activeDean.name}</strong>.
                Are you sure you want to activate this Dean and replace the currently active Dean?
              </AlertDialogDescription>
            </div>
          ) : (
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
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-5 flex items-center justify-end gap-2">
          <AlertDialogCancel
            disabled={toggleStatusMutation.isPending || isLoadingDean}
            className="rounded-lg bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-3.5 py-1.5 cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirmAction();
            }}
            disabled={toggleStatusMutation.isPending || isLoadingDean}
            className={`rounded-lg text-white text-xs font-semibold px-3.5 py-1.5 cursor-pointer ${
              hasActiveDeanConflict
                ? "bg-amber-600 hover:bg-amber-700"
                : isTogglingActive
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {toggleStatusMutation.isPending
              ? "Processing..."
              : hasActiveDeanConflict
                ? "Activate & Deactivate Current"
                : `Confirm ${isTogglingActive ? "Deactivation" : "Activation"}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
