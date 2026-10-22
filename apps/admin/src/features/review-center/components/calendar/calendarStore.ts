import { create } from "zustand";
import type { CalendarEvent, CalendarViewMode, CategoryFilterItem } from "./types";
import type { ReviewSchedule } from "../../types/types";
import useAuth from "@/hooks/useAuth";

export const DEFAULT_CALENDAR_CATEGORIES: CategoryFilterItem[] = [
  { id: "Events", label: "Events", color: "#8b5cf6", checked: true },
  { id: "Tasks", label: "Tasks", color: "#f59e0b", checked: true },
  { id: "Reminder", label: "Reminder", color: "#0ea5e9", checked: true },
  { id: "Holidays", label: "Academic Breaks & Holidays", color: "#10b981", checked: true },
  { id: "Board Review", label: "Review & Mock Programs", color: "#6366f1", checked: true },
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
    })),

  openCreateModal: (date?: Date, time?: string) =>
    set((state) => ({
      isModalOpen: true,
      selectedEvent: null,
      currentDate: date || state.currentDate,
      prefilledTime: time,
      isDetailsOpen: false,
      detailsAnchorEl: null,
    })),

  openEditModal: (event: CalendarEvent) =>
    set({
      isModalOpen: true,
      selectedEvent: event,
      prefilledTime: undefined,
      isDetailsOpen: false,
      detailsAnchorEl: null,
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
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
  const currentRole = String(currentUser?.role || "").toUpperCase();
  const currentUserId = currentUser?.id ? String(currentUser.id).trim().toLowerCase() : null;
  const currentUserEmail = currentUser?.email ? String(currentUser.email).trim().toLowerCase() : null;
  const currentUserName = currentUser?.name
    ? String(currentUser.name).trim().toLowerCase()
    : [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ").trim().toLowerCase();

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
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    colorKey: "indigo",
    description: s.description,
    isSchedule: true,
    status: s.status,
  }));

  const allEvents = [...backendEvents, ...customEvents];

  return allEvents.filter((event) => {
    // 1. Attendee / Author visibility filter:
    // Non-superadmins only see events where they are an attendee OR the author/creator
    if (currentRole && currentRole !== "SUPERADMIN" && !event.isSchedule) {
      const isAuthor =
        (currentUserId && event.authorId && String(event.authorId).trim().toLowerCase() === currentUserId) ||
        (currentUserEmail && event.authorEmail && String(event.authorEmail).trim().toLowerCase() === currentUserEmail) ||
        (currentUserName && event.authorName && String(event.authorName).trim().toLowerCase() === currentUserName) ||
        (event.createdBy && (
          (typeof event.createdBy === "string" && (
            (currentUserId && event.createdBy.trim().toLowerCase() === currentUserId) ||
            (currentUserEmail && event.createdBy.trim().toLowerCase() === currentUserEmail) ||
            (currentUserName && event.createdBy.trim().toLowerCase() === currentUserName)
          )) ||
          (typeof event.createdBy === "object" && (
            (currentUserId && (event.createdBy as any).id && String((event.createdBy as any).id).trim().toLowerCase() === currentUserId) ||
            (currentUserEmail && (event.createdBy as any).email && String((event.createdBy as any).email).trim().toLowerCase() === currentUserEmail) ||
            (currentUserName && (event.createdBy as any).name && String((event.createdBy as any).name).trim().toLowerCase() === currentUserName)
          ))
        ));

      const isAttendee =
        Array.isArray(event.attendees) &&
        event.attendees.some((a: any) => {
          if (!a) return false;
          if (typeof a === "string") {
            const str = a.trim().toLowerCase();
            return (currentUserEmail && str === currentUserEmail) || (currentUserName && str === currentUserName);
          }
          const aEmail = String(a.email || "").trim().toLowerCase();
          const aName = String(a.name || "").trim().toLowerCase();
          const aId = String(a.id || a._id || a.userId || "").trim().toLowerCase();

          return (
            (currentUserEmail && (aEmail === currentUserEmail || aName === currentUserEmail)) ||
            (currentUserId && aId && aId === currentUserId) ||
            (currentUserName && aName === currentUserName)
          );
        });

      if (!isAuthor && !isAttendee) {
        return false;
      }
    }

    // 2. Category filter
    if (!activeCategorySet.has(event.category)) {
      return false;
    }

    // 3. Search filter
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
