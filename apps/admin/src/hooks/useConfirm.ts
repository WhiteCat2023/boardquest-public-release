import { useCallback } from "react";
import { useModalStore, type ConfirmOptions } from "@/store/modalStore";

/**
 * Hook to trigger promise-based or callback-based confirmation dialogs
 * 
 * Example usage:
 * ```tsx
 * const { confirm } = useConfirm();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: "Delete Question?",
 *     description: "This action cannot be undone.",
 *     variant: "destructive",
 *     confirmText: "Delete",
 *   });
 *   if (confirmed) {
 *     // perform delete
 *   }
 * };
 * ```
 */
export function useConfirm() {
  const storeConfirm = useModalStore((state) => state.confirm);

  const confirm = useCallback(
    (options: ConfirmOptions) => {
      return storeConfirm(options);
    },
    [storeConfirm]
  );

  return { confirm };
}

export default useConfirm;
