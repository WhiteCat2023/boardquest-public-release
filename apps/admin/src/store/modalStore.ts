import { create } from "zustand";
import React from "react";

export type ModalVariant = "default" | "destructive" | "warning" | "info";
export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";
export type FeedbackVariant = "success" | "error" | "warning" | "info" | "default";

export interface ConfirmOptions {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  icon?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export interface CustomModalOptions {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  content: React.ReactNode | ((helpers: { close: () => void }) => React.ReactNode);
  size?: ModalSize;
  className?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export interface FeedbackDialogOptions {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: FeedbackVariant;
  confirmText?: string;
  action?: {
    label: string;
    onClick: (e?: React.MouseEvent) => void;
  };
  cancel?: {
    label: string;
    onClick?: (e?: React.MouseEvent) => void;
  };
  onConfirm?: () => void;
  onClose?: () => void;
}

// Extensible modal map for type-safe registered modals
export interface ModalRegistry {
  CONFIRM: ConfirmOptions;
  CUSTOM: CustomModalOptions;
  FEEDBACK: FeedbackDialogOptions;
  [key: string]: Record<string, any>;
}

export type ModalType = keyof ModalRegistry;

export interface ModalInstance<T extends ModalType = ModalType> {
  id: string;
  type: T;
  props: ModalRegistry[T];
}

interface ModalStore {
  modalStack: ModalInstance[];
  
  /** Open a registered named modal by type */
  openModal: <T extends ModalType>(type: T, props: ModalRegistry[T]) => string;
  
  /** Open a custom inline dialog */
  openCustom: (options: CustomModalOptions) => string;
  
  /** Open an alert/feedback notification dialog (replacing toasts) */
  openFeedback: (options: FeedbackDialogOptions) => string;
  
  /** Open a confirmation dialog that returns a Promise<boolean> */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  
  /** Close a specific modal by ID or close the topmost modal if ID is omitted */
  closeModal: (id?: string) => void;
  
  /** Close all active modals */
  closeAll: () => void;

  /** Update props of an open modal (e.g. for loading states) */
  updateModalProps: (id: string, props: Record<string, unknown>) => void;
}

let modalCounter = 0;
const generateModalId = () => `modal_${Date.now()}_${++modalCounter}`;

export const useModalStore = create<ModalStore>((set, get) => ({
  modalStack: [],

  openModal: (type, props) => {
    const id = (props as Record<string, any>)?.id || generateModalId();
    const instance: ModalInstance = { id, type, props: { ...(props as Record<string, any>), id } as any };
    set((state) => ({
      modalStack: [...state.modalStack.filter((m) => m.id !== id), instance],
    }));
    return id;
  },

  openCustom: (options) => {
    return get().openModal("CUSTOM", options);
  },

  openFeedback: (options) => {
    const id = options.id || generateModalId();
    const instance: ModalInstance = {
      id,
      type: "FEEDBACK",
      props: { ...options, id } as any,
    };
    set((state) => ({
      // Dismiss any existing feedback dialog so rapid toasts don't stack multiple backdrops
      modalStack: [
        ...state.modalStack.filter((m) => m.type !== "FEEDBACK" && m.id !== id),
        instance,
      ],
    }));
    return id;
  },

  confirm: (options) => {
    return new Promise<boolean>((resolve) => {
      const id = options.id || generateModalId();

      const handleConfirm = async () => {
        try {
          if (options.onConfirm) {
            get().updateModalProps(id, { isLoading: true });
            await options.onConfirm();
          }
          get().closeModal(id);
          resolve(true);
        } catch (error) {
          get().updateModalProps(id, { isLoading: false });
          throw error;
        }
      };

      const handleCancel = () => {
        if (options.onCancel) {
          options.onCancel();
        }
        get().closeModal(id);
        resolve(false);
      };

      get().openModal("CONFIRM", {
        ...options,
        id,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
      });
    });
  },

  closeModal: (id) => {
    set((state) => {
      if (state.modalStack.length === 0) return state;
      if (!id) {
        // Pop topmost modal
        const topModal = state.modalStack[state.modalStack.length - 1];
        if (topModal.type === "CUSTOM" && (topModal.props as CustomModalOptions).onClose) {
          (topModal.props as CustomModalOptions).onClose?.();
        }
        return { modalStack: state.modalStack.slice(0, -1) };
      }
      const targetModal = state.modalStack.find((m) => m.id === id);
      if (targetModal?.type === "CUSTOM" && (targetModal.props as CustomModalOptions).onClose) {
        (targetModal.props as CustomModalOptions).onClose?.();
      }
      return { modalStack: state.modalStack.filter((m) => m.id !== id) };
    });
  },

  closeAll: () => {
    set({ modalStack: [] });
  },

  updateModalProps: (id, props) => {
    set((state) => ({
      modalStack: state.modalStack.map((m) =>
        m.id === id ? { ...m, props: { ...(m.props as Record<string, any>), ...props } as any } : m
      ),
    }));
  },
}));

/** Standalone confirm function usable outside React components */
export const confirm = (options: ConfirmOptions) => useModalStore.getState().confirm(options);

function normalizeFeedback(
  variant: FeedbackVariant,
  message: React.ReactNode | Error | any,
  options?: Record<string, any>,
): string {
  let displayMessage: React.ReactNode = message;
  if (message instanceof Error) {
    displayMessage = message.message;
  }

  let title: React.ReactNode | undefined;
  let description: React.ReactNode | undefined;

  if (options?.description) {
    title = displayMessage;
    description = options.description;
  } else {
    description = displayMessage;
  }

  const id = options?.id ? String(options.id) : undefined;

  return useModalStore.getState().openFeedback({
    id,
    variant,
    title: options?.title || title,
    description,
    confirmText: options?.confirmText,
    action: options?.action,
    cancel: options?.cancel,
    onClose: () => {
      if (options?.onDismiss) options.onDismiss({ id });
      if (options?.onClose) options.onClose();
    },
  });
}

const baseFeedback = (messageOrOptions: React.ReactNode | FeedbackDialogOptions, options?: Record<string, any>): string => {
  if (messageOrOptions && typeof messageOrOptions === "object" && !React.isValidElement(messageOrOptions) && "variant" in (messageOrOptions as any)) {
    return useModalStore.getState().openFeedback(messageOrOptions as FeedbackDialogOptions);
  }
  return normalizeFeedback("default", messageOrOptions, options);
};

/** Standalone feedback/alert dialog function usable outside React components */
export const showFeedback = Object.assign(baseFeedback, {
  success: (message: React.ReactNode, options?: Record<string, any>) =>
    normalizeFeedback("success", message, options),
  error: (message: React.ReactNode, options?: Record<string, any>) =>
    normalizeFeedback("error", message, options),
  warning: (message: React.ReactNode, options?: Record<string, any>) =>
    normalizeFeedback("warning", message, options),
  info: (message: React.ReactNode, options?: Record<string, any>) =>
    normalizeFeedback("info", message, options),
  loading: (message: React.ReactNode, options?: Record<string, any>) =>
    normalizeFeedback("info", message, options),
  custom: (
    jsx: (id: string | number) => React.ReactNode | React.ReactNode,
    options?: Record<string, any>,
  ) => {
    const id = options?.id ? String(options.id) : `custom_${Date.now()}`;
    const content = typeof jsx === "function" ? jsx(id) : jsx;
    useModalStore.getState().openCustom({
      id,
      content,
      showCloseButton:
        options?.showCloseButton !== undefined ? options.showCloseButton : true,
      size: options?.size,
      className: options?.className,
      onClose: () => {
        if (options?.onDismiss) options.onDismiss({ id });
        if (options?.onClose) options.onClose();
      },
    });
    return id;
  },
  dismiss: (id?: string | number) => {
    if (id !== undefined) {
      useModalStore.getState().closeModal(String(id));
    } else {
      useModalStore.getState().closeModal();
    }
  },
});

/** Standalone modal actions */
export const openModal = <T extends ModalType>(type: T, props: ModalRegistry[T]) =>
  useModalStore.getState().openModal(type, props);

export const closeModal = (id?: string) => useModalStore.getState().closeModal(id);
export const closeAllModals = () => useModalStore.getState().closeAll();
