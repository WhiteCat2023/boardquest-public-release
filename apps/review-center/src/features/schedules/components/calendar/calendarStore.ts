import { create } from "zustand";
import type { CalendarEvent, CalendarViewMode, CategoryFilterItem } from "./types";
import type { ReviewSchedule } from "../../api/useCalendar";

export const DEFAULT_CALENDAR_CATEGORIES: CategoryFilterItem[] = [
  { id: "Board Review", label: "Board Review", color: "#8b5cf6", checked: true },
  { id: "Comprehensive Review", label: "Comprehensive Review", color: "#6366f1", checked: true },
  { id: "Diagnostic Drill", label: "Diagnostic Drill", color: "#0ea5e9", checked: true },
  { id: "Pre-Board Mock Exam", label: "Pre-Board Mock Exam", color: "#f59e0b", checked: true },
  { id: "Final Coaching & High-Yield", label: "Final Coaching & High-Yield", color: "#10b981", checked: true },
  { id: "Remedial & Refresher Session", label: "Remedial & Refresher Session", color: "#ec4899", checked: true },
  { id: "Events", label: "Other Events", color: "#14b8a6", checked: true },
];

export interface CalendarStoreState {
  currentDate: Date;
  viewMode: CalendarViewMode;
  searchQuery: string;
  categories: CategoryFilterItem[];
  customEvents: CalendarEvent[];
  backendSchedules: ReviewSchedule[];

  // Modal State
  isModalOpen: boolean;
  selectedEvent: CalendarEvent | null;
  prefilledTime: string | undefined;

  // Details Dialog State (When viewing an event)
  isDetailsOpen: boolean;
  viewingEvent: CalendarEvent | null;
  detailsAnchorEl: HTMLElement | null;
  detailsAnchorRect: { top: number; left: number; width: number; height: number } | null;

  // Dynamic sidebar state (Vercel-style sub-sidebar)
  showCalendarSubSidebar: boolean;

  // Actions
  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  setSearchQuery: (q: string) => void;
  toggleCategory: (id: string) => void;
  setCategories: (categories: CategoryFilterItem[]) => void;
  setBackendSchedules: (schedules: ReviewSchedule[]) => void;
  setCustomEvents: (
    events: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])
  ) => void;
  addCustomEvent: (event: CalendarEvent) => void;
  updateCustomEvent: (event: CalendarEvent) => void;
  deleteCustomEvent: (id: string) => void;

  openCreateModal: (date?: Date, time?: string) => void;
  openEditModal: (event: CalendarEvent) => void;
  closeModal: () => void;

  openDetails: (
    event: CalendarEvent,
    anchorEl?: HTMLElement | null,
    anchorRect?: { top: number; left: number; width: number; height: number } | null
  ) => void;
  closeDetails: () => void;

  setShowCalendarSubSidebar: (show: boolean) => void;
}

export const useCalendarStore = create<CalendarStoreState>((set) => ({
  currentDate: new Date(),
  viewMode: "month",
  searchQuery: "",
  categories: DEFAULT_CALENDAR_CATEGORIES,
  customEvents: [],
  backendSchedules: [],

  isModalOpen: false,
  selectedEvent: null,
  prefilledTime: undefined,

  isDetailsOpen: false,
  viewingEvent: null,
  detailsAnchorEl: null,
  detailsAnchorRect: null,

  showCalendarSubSidebar: true,

  setCurrentDate: (date: Date) => set({ currentDate: date }),
  setViewMode: (mode: CalendarViewMode) => set({ viewMode: mode }),
  setSearchQuery: (q: string) => set({ searchQuery: q }),

  toggleCategory: (id: string) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, checked: !c.checked } : c
      ),
    })),

  setCategories: (categories: CategoryFilterItem[]) => set({ categories }),

  setBackendSchedules: (schedules: ReviewSchedule[]) =>
    set((state) => {
      const incoming = schedules || [];
      if (
        state.backendSchedules.length === incoming.length &&
        state.backendSchedules.every((s, i) => s.id === incoming[i]?.id)
      ) {
        return state;
      }
      return { backendSchedules: incoming };
    }),

  setCustomEvents: (events) =>
    set((state) => {
      const incoming =
        typeof events === "function" ? events(state.customEvents) : events || [];
      if (
        state.customEvents.length === incoming.length &&
        state.customEvents.every(
          (e, i) =>
            e.id === incoming[i]?.id &&
            e.title === incoming[i]?.title &&
            e.startDate === incoming[i]?.startDate &&
            e.endDate === incoming[i]?.endDate
        )
      ) {
        return state;
      }
      return { customEvents: incoming };
    }),

  addCustomEvent: (event: CalendarEvent) =>
    set((state) => ({
      customEvents: [event, ...state.customEvents],
    })),

  updateCustomEvent: (event: CalendarEvent) =>
    set((state) => ({
      customEvents: state.customEvents.map((e) =>
        e.id === event.id ? event : e
      ),
    })),

  deleteCustomEvent: (id: string) =>
    set((state) => ({
      customEvents: state.customEvents.filter((e) => e.id !== id),
      isDetailsOpen: state.viewingEvent?.id === id ? false : state.isDetailsOpen,
      viewingEvent: state.viewingEvent?.id === id ? null : state.viewingEvent,
      detailsAnchorEl: state.viewingEvent?.id === id ? null : state.detailsAnchorEl,
      detailsAnchorRect: state.viewingEvent?.id === id ? null : state.detailsAnchorRect,
    })),

  openCreateModal: (date?: Date, time?: string) =>
    set((state) => ({
      isModalOpen: true,
      selectedEvent: null,
      currentDate: date || state.currentDate,
      prefilledTime: time,
      isDetailsOpen: false,
      detailsAnchorEl: null,
      detailsAnchorRect: null,
    })),

  openEditModal: (event: CalendarEvent) =>
    set({
      isModalOpen: true,
      selectedEvent: event,
      prefilledTime: undefined,
      isDetailsOpen: false,
      detailsAnchorEl: null,
      detailsAnchorRect: null,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      selectedEvent: null,
      prefilledTime: undefined,
    }),

  openDetails: (
    event: CalendarEvent,
    anchorEl?: HTMLElement | null,
    anchorRect?: { top: number; left: number; width: number; height: number } | null
  ) => {
    let rect = anchorRect || null;
    if (!rect && anchorEl) {
      try {
        const r = anchorEl.getBoundingClientRect();
        if (r.width > 0 || r.height > 0 || r.top > 0 || r.left > 0) {
          rect = {
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height,
          };
        }
      } catch {}
    }

    set({
      isDetailsOpen: true,
      viewingEvent: event,
      detailsAnchorEl: anchorEl || null,
      detailsAnchorRect: rect,
      isModalOpen: false,
    });
  },

  closeDetails: () =>
    set({
      isDetailsOpen: false,
      viewingEvent: null,
      detailsAnchorEl: null,
      detailsAnchorRect: null,
    }),

  setShowCalendarSubSidebar: (show: boolean) =>
    set({ showCalendarSubSidebar: show }),
}));

// Helper selector to get all merged and filtered events
export function useFilteredCalendarEvents(): CalendarEvent[] {
  const {
    customEvents,
    backendSchedules,
    categories,
    searchQuery,
  } = useCalendarStore();

  const activeCategorySet = new Set(
    categories.filter((c) => c.checked).map((c) => c.id)
  );

  // Map backend schedules to CalendarEvent items
  const backendEvents: CalendarEvent[] = (backendSchedules || []).map((s) => ({
    id: s.id,
    title: s.title,
    category: s.category || "Board Review",
    startDate: s.startDate,
    endDate: s.endDate,
    startTime: (s as any).startTime || "09:00 AM",
    endTime: (s as any).endTime || "10:00 AM",
    colorKey: (s as any).colorKey || "indigo",
    description: s.description,
    isSchedule: true,
    status: s.status,
    companyName: s.companyName,
    location: (s as any).location,
    conferenceType: (s as any).conferenceType,
    link: (s as any).link,
    attendees: (s as any).attendees,
    attachments: (s as any).attachments,
    labels: (s as any).labels,
    authorName: (s as any).authorName,
    authorEmail: (s as any).authorEmail,
    authorId: (s as any).authorId,
    createdBy: (s as any).createdBy,
    isCalendarEvent: (s as any).isCalendarEvent,
  }));

  const allEvents = [...backendEvents, ...customEvents];

  return allEvents.filter((event) => {
    // 1. Category filter
    if (activeCategorySet.size > 0 && !activeCategorySet.has(event.category)) {
      if (
        activeCategorySet.has("Events") &&
        ["Tasks", "Reminder", "Holidays", "Academic Breaks & Holidays"].includes(event.category)
      ) {
        // allow under "Other Events"
      } else {
        return false;
      }
    }

    // 2. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = event.title.toLowerCase().includes(q);
      const matchCat = event.category.toLowerCase().includes(q);
      const matchDesc = event.description?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchCat && !matchDesc) {
        return false;
      }
    }

    return true;
  });
}
