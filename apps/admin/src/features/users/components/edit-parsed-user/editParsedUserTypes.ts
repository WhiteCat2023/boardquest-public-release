import type { ParsedUserRow } from "../../types/types";

export interface EditParsedUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  row: ParsedUserRow | null;
  rowIndex: number | null;
  accountCategory?: "internal" | "external";
  onSave: (index: number, updatedRow: ParsedUserRow) => void;
}
