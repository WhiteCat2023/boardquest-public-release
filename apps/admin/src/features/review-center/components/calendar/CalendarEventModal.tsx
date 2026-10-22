import React from "react";
import { CalendarEventDrawer } from "./CalendarEventDrawer";
import type { CalendarEvent } from "./types";

export interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEvent?: CalendarEvent | null;
  defaultDate?: Date;
  defaultTime?: string;
  onSave: (eventData: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: string) => void;
  canManage?: boolean;
}

/**
 * CalendarEventModal now delegates directly to CalendarEventDrawer
 * to render the side drawer instead of the center modal.
 */
export function CalendarEventModal(props: CalendarEventModalProps) {
  return <CalendarEventDrawer {...props} />;
}

export default CalendarEventModal;
