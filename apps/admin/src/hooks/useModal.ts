import { useModalStore, type ModalType, type ModalRegistry, type CustomModalOptions, type ConfirmOptions } from "@/store/modalStore";

/**
 * Hook for managing global modals, alerts, and custom dynamic dialogs
 */
export function useModal() {
  const modalStack = useModalStore((state) => state.modalStack);
  const openModal = useModalStore((state) => state.openModal);
  const openCustom = useModalStore((state) => state.openCustom);
  const confirm = useModalStore((state) => state.confirm);
  const closeModal = useModalStore((state) => state.closeModal);
  const closeAll = useModalStore((state) => state.closeAll);
  const updateModalProps = useModalStore((state) => state.updateModalProps);

  return {
    modalStack,
    isOpen: modalStack.length > 0,
    activeModal: modalStack.length > 0 ? modalStack[modalStack.length - 1] : null,
    openModal: <T extends ModalType>(type: T, props: ModalRegistry[T]) => openModal(type, props),
    openCustom: (options: CustomModalOptions) => openCustom(options),
    confirm: (options: ConfirmOptions) => confirm(options),
    closeModal,
    closeAll,
    updateModalProps,
  };
}

export default useModal;
