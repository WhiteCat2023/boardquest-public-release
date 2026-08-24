import React, { Suspense } from "react";
import {
  useModalStore,
  type ConfirmOptions,
  type CustomModalOptions,
} from "@/store/modalStore";
import ConfirmDialog from "./ConfirmDialog";
import CustomDialogRenderer from "./CustomDialogRenderer";
import { Loader2 } from "lucide-react";

export const GlobalModalContainer: React.FC = () => {
  const modalStack = useModalStore((state) => state.modalStack);
  const closeModal = useModalStore((state) => state.closeModal);

  if (modalStack.length === 0) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs">
          <div className="flex items-center gap-2 rounded-2xl bg-card p-4 shadow-xl border border-border">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span className="text-xs font-semibold text-foreground">Loading...</span>
          </div>
        </div>
      }
    >
      {modalStack.map((modal) => {
        if (modal.type === "CONFIRM") {
          const confirmProps = modal.props as unknown as ConfirmOptions;
          return (
            <ConfirmDialog
              key={modal.id}
              isOpen={true}
              {...confirmProps}
              onClose={() => closeModal(modal.id)}
            />
          );
        }

        if (modal.type === "CUSTOM") {
          const customProps = modal.props as unknown as CustomModalOptions;
          return (
            <CustomDialogRenderer
              key={modal.id}
              isOpen={true}
              {...customProps}
              onClose={() => closeModal(modal.id)}
            />
          );
        }

        return null;
      })}
    </Suspense>
  );
};

export default GlobalModalContainer;
