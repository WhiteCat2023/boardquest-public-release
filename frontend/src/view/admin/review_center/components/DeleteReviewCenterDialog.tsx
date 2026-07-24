import { Trash2 } from "lucide-react";
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
import type { ReviewCenterRepresentative } from "../types";

interface DeleteReviewCenterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: ReviewCenterRepresentative | null;
  onConfirm: () => void;
}

export default function DeleteReviewCenterDialog({
  isOpen,
  onOpenChange,
  item,
  onConfirm,
}: DeleteReviewCenterDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Trash2 className="text-red-600" size={20} />
            Remove Review Center
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-slate-500 mt-2 leading-relaxed">
            Are you sure you want to remove{" "}
            <strong className="text-slate-800">{item?.companyName}</strong> (
            {item?.name}) from the directory?
            <br />
            This action will revoke representative credentials for this institution.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
          <AlertDialogCancel className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 text-xs font-semibold px-4 py-2 cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 cursor-pointer"
          >
            Confirm Removal
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
