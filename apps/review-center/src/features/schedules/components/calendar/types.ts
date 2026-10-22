export type CalendarViewMode = "month" | "week" | "day" | "year";

export interface CalendarEventAttachment {
  id: string;
  name: string;
  size?: string;
  url?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  category: string; // "Events" | "Tasks" | "Reminder" | "Holidays" | "Board Review" | "Mock Exam" | string
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // e.g. "08:30 AM" or "08:30"
  endTime?: string; // e.g. "09:00 AM" or "09:00"
  location?: string;
  link?: string;
  conferenceType?: string; // "In-Person" | "Online" | "Hybrid" | string
  description?: string;
  companyName?: string;
  status?: string; // "UPCOMING" | "ONGOING" | "COMPLETED"
  colorKey?:
    | "purple"
    | "orange"
    | "blue"
    | "green"
    | "teal"
    | "indigo"
    | "rose"
    | "amber"
    | "slate"
    | string;
  labels?: string[];
  attendees?: {
    name: string;
    email?: string;
    avatarUrl?: string;
    initials?: string;
    role?: string;
    accountType?: "internal" | "external";
    organization?: string;
  }[];
  attachments?: CalendarEventAttachment[];
  solutionNotes?: string;
  isBackendSchedule?: boolean;
  isSchedule?: boolean;
  isCalendarEvent?: boolean;
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
  createdBy?: string | { id?: string; name?: string; email?: string };
}

export interface CategoryFilterItem {
  id: string;
  label: string;
  color: string;
  checked: boolean;
}

export interface EventColorStyle {
  borderLeft: string;
  bg: string;
  text: string;
  dot: string;
  badge: string;
}

export interface ColorSwatchItem {
  key: string;
  label: string;
  colorHex: string;
  bgClass: string;
  borderClass: string;
}

export const GOOGLE_CALENDAR_ROW1: ColorSwatchItem[] = [
  { key: "crimson", label: "Amethyst / Crimson", colorHex: "#ad1457", bgClass: "bg-[#ad1457]", borderClass: "border-[#ad1457]" },
  { key: "flamingo", label: "Flamingo", colorHex: "#e61972", bgClass: "bg-[#e61972]", borderClass: "border-[#e61972]" },
  { key: "salmon", label: "Salmon", colorHex: "#f06f61", bgClass: "bg-[#f06f61]", borderClass: "border-[#f06f61]" },
  { key: "tomato", label: "Tomato", colorHex: "#d50000", bgClass: "bg-[#d50000]", borderClass: "border-[#d50000]" },
  { key: "tangerine", label: "Tangerine", colorHex: "#f4511e", bgClass: "bg-[#f4511e]", borderClass: "border-[#f4511e]" },
  { key: "pumpkin", label: "Pumpkin", colorHex: "#ef6c00", bgClass: "bg-[#ef6c00]", borderClass: "border-[#ef6c00]" },
  { key: "mango", label: "Mango", colorHex: "#f09300", bgClass: "bg-[#f09300]", borderClass: "border-[#f09300]" },
  { key: "banana", label: "Banana", colorHex: "#f6bf26", bgClass: "bg-[#f6bf26]", borderClass: "border-[#f6bf26]" },
  { key: "sunflower", label: "Sunflower", colorHex: "#e2c222", bgClass: "bg-[#e2c222]", borderClass: "border-[#e2c222]" },
  { key: "avocado", label: "Avocado", colorHex: "#b5c425", bgClass: "bg-[#b5c425]", borderClass: "border-[#b5c425]" },
  { key: "basil", label: "Basil", colorHex: "#0b8043", bgClass: "bg-[#0b8043]", borderClass: "border-[#0b8043]" },
  { key: "sage", label: "Sage", colorHex: "#009688", bgClass: "bg-[#009688]", borderClass: "border-[#009688]" },
];

export const GOOGLE_CALENDAR_ROW2: ColorSwatchItem[] = [
  { key: "peacock", label: "Peacock", colorHex: "#00897b", bgClass: "bg-[#00897b]", borderClass: "border-[#00897b]" },
  { key: "blueberry", label: "Blueberry", colorHex: "#039be5", bgClass: "bg-[#039be5]", borderClass: "border-[#039be5]" },
  { key: "periwinkle", label: "Periwinkle", colorHex: "#7986cb", bgClass: "bg-[#7986cb]", borderClass: "border-[#7986cb]" },
  { key: "cobalt", label: "Cobalt", colorHex: "#3f51b5", bgClass: "bg-[#3f51b5]", borderClass: "border-[#3f51b5]" },
  { key: "lavender", label: "Lavender", colorHex: "#b39ddb", bgClass: "bg-[#b39ddb]", borderClass: "border-[#b39ddb]" },
  { key: "grape", label: "Grape", colorHex: "#9c27b0", bgClass: "bg-[#9c27b0]", borderClass: "border-[#9c27b0]" },
  { key: "purple", label: "Purple", colorHex: "#8e24aa", bgClass: "bg-[#8e24aa]", borderClass: "border-[#8e24aa]" },
  { key: "cocoa", label: "Cocoa", colorHex: "#795548", bgClass: "bg-[#795548]", borderClass: "border-[#795548]" },
  { key: "graphite", label: "Graphite", colorHex: "#616161", bgClass: "bg-[#616161]", borderClass: "border-[#616161]" },
  { key: "stone", label: "Stone", colorHex: "#a1887f", bgClass: "bg-[#a1887f]", borderClass: "border-[#a1887f]" },
];

export const COLOR_SWATCHES: ColorSwatchItem[] = [
  ...GOOGLE_CALENDAR_ROW1,
  ...GOOGLE_CALENDAR_ROW2,
  // Backward compatibility aliases
  { key: "orange", label: "Orange", colorHex: "#ef6c00", bgClass: "bg-[#ef6c00]", borderClass: "border-[#ef6c00]" },
  { key: "blue", label: "Sky Blue", colorHex: "#039be5", bgClass: "bg-[#039be5]", borderClass: "border-[#039be5]" },
  { key: "green", label: "Emerald", colorHex: "#0b8043", bgClass: "bg-[#0b8043]", borderClass: "border-[#0b8043]" },
  { key: "teal", label: "Teal", colorHex: "#00897b", bgClass: "bg-[#00897b]", borderClass: "border-[#00897b]" },
  { key: "rose", label: "Rose", colorHex: "#e61972", bgClass: "bg-[#e61972]", borderClass: "border-[#e61972]" },
  { key: "indigo", label: "Indigo", colorHex: "#3f51b5", bgClass: "bg-[#3f51b5]", borderClass: "border-[#3f51b5]" },
  { key: "amber", label: "Amber", colorHex: "#f09300", bgClass: "bg-[#f09300]", borderClass: "border-[#f09300]" },
  { key: "slate", label: "Slate", colorHex: "#616161", bgClass: "bg-[#616161]", borderClass: "border-[#616161]" },
];

export const CATEGORY_COLORS: Record<string, EventColorStyle> = {
  // Legacy Aliases
  purple: {
    borderLeft: "border-l-[#8e24aa] dark:border-l-[#ab47bc]",
    bg: "bg-[#8e24aa]/10 dark:bg-[#8e24aa]/15",
    text: "text-[#6a1b9a] dark:text-[#ce93d8]",
    dot: "bg-[#8e24aa]",
    badge: "bg-[#8e24aa]/15 text-[#6a1b9a] dark:text-[#ce93d8] border-[#8e24aa]/30",
  },
  orange: {
    borderLeft: "border-l-[#ef6c00] dark:border-l-[#ffa726]",
    bg: "bg-[#ef6c00]/10 dark:bg-[#ef6c00]/15",
    text: "text-[#e65100] dark:text-[#ffb74d]",
    dot: "bg-[#ef6c00]",
    badge: "bg-[#ef6c00]/15 text-[#e65100] dark:text-[#ffb74d] border-[#ef6c00]/30",
  },
  blue: {
    borderLeft: "border-l-[#039be5] dark:border-l-[#29b6f6]",
    bg: "bg-[#039be5]/10 dark:bg-[#039be5]/15",
    text: "text-[#0277bd] dark:text-[#4fc3f7]",
    dot: "bg-[#039be5]",
    badge: "bg-[#039be5]/15 text-[#0277bd] dark:text-[#4fc3f7] border-[#039be5]/30",
  },
  green: {
    borderLeft: "border-l-[#0b8043] dark:border-l-[#26a69a]",
    bg: "bg-[#0b8043]/10 dark:bg-[#0b8043]/15",
    text: "text-[#0b8043] dark:text-[#81c784]",
    dot: "bg-[#0b8043]",
    badge: "bg-[#0b8043]/15 text-[#0b8043] dark:text-[#81c784] border-[#0b8043]/30",
  },
  teal: {
    borderLeft: "border-l-[#00897b] dark:border-l-[#26a69a]",
    bg: "bg-[#00897b]/10 dark:bg-[#00897b]/15",
    text: "text-[#00695c] dark:text-[#4db6ac]",
    dot: "bg-[#00897b]",
    badge: "bg-[#00897b]/15 text-[#00695c] dark:text-[#4db6ac] border-[#00897b]/30",
  },
  rose: {
    borderLeft: "border-l-[#e61972] dark:border-l-[#f06292]",
    bg: "bg-[#e61972]/10 dark:bg-[#e61972]/15",
    text: "text-[#ad1457] dark:text-[#f48fb1]",
    dot: "bg-[#e61972]",
    badge: "bg-[#e61972]/15 text-[#ad1457] dark:text-[#f48fb1] border-[#e61972]/30",
  },
  indigo: {
    borderLeft: "border-l-[#3f51b5] dark:border-l-[#7986cb]",
    bg: "bg-[#3f51b5]/10 dark:bg-[#3f51b5]/15",
    text: "text-[#283593] dark:text-[#9fa8da]",
    dot: "bg-[#3f51b5]",
    badge: "bg-[#3f51b5]/15 text-[#283593] dark:text-[#9fa8da] border-[#3f51b5]/30",
  },
  amber: {
    borderLeft: "border-l-[#f09300] dark:border-l-[#ffb74d]",
    bg: "bg-[#f09300]/10 dark:bg-[#f09300]/15",
    text: "text-[#e65100] dark:text-[#ffe082]",
    dot: "bg-[#f09300]",
    badge: "bg-[#f09300]/15 text-[#e65100] dark:text-[#ffe082] border-[#f09300]/30",
  },
  slate: {
    borderLeft: "border-l-[#616161] dark:border-l-[#9e9e9e]",
    bg: "bg-[#616161]/10 dark:bg-[#616161]/15",
    text: "text-[#424242] dark:text-[#e0e0e0]",
    dot: "bg-[#616161]",
    badge: "bg-[#616161]/15 text-[#424242] dark:text-[#e0e0e0] border-[#616161]/30",
  },

  // Full 22 Google Calendar colors
  crimson: {
    borderLeft: "border-l-[#ad1457]",
    bg: "bg-[#ad1457]/10 dark:bg-[#ad1457]/15",
    text: "text-[#880e4f] dark:text-[#f48fb1]",
    dot: "bg-[#ad1457]",
    badge: "bg-[#ad1457]/15 text-[#880e4f] dark:text-[#f48fb1] border-[#ad1457]/30",
  },
  flamingo: {
    borderLeft: "border-l-[#e61972]",
    bg: "bg-[#e61972]/10 dark:bg-[#e61972]/15",
    text: "text-[#ad1457] dark:text-[#f48fb1]",
    dot: "bg-[#e61972]",
    badge: "bg-[#e61972]/15 text-[#ad1457] dark:text-[#f48fb1] border-[#e61972]/30",
  },
  salmon: {
    borderLeft: "border-l-[#f06f61]",
    bg: "bg-[#f06f61]/10 dark:bg-[#f06f61]/15",
    text: "text-[#c62828] dark:text-[#ef9a9a]",
    dot: "bg-[#f06f61]",
    badge: "bg-[#f06f61]/15 text-[#c62828] dark:text-[#ef9a9a] border-[#f06f61]/30",
  },
  tomato: {
    borderLeft: "border-l-[#d50000]",
    bg: "bg-[#d50000]/10 dark:bg-[#d50000]/15",
    text: "text-[#b71c1c] dark:text-[#ef5350]",
    dot: "bg-[#d50000]",
    badge: "bg-[#d50000]/15 text-[#b71c1c] dark:text-[#ef5350] border-[#d50000]/30",
  },
  tangerine: {
    borderLeft: "border-l-[#f4511e]",
    bg: "bg-[#f4511e]/10 dark:bg-[#f4511e]/15",
    text: "text-[#bf360c] dark:text-[#ff7043]",
    dot: "bg-[#f4511e]",
    badge: "bg-[#f4511e]/15 text-[#bf360c] dark:text-[#ff7043] border-[#f4511e]/30",
  },
  pumpkin: {
    borderLeft: "border-l-[#ef6c00]",
    bg: "bg-[#ef6c00]/10 dark:bg-[#ef6c00]/15",
    text: "text-[#e65100] dark:text-[#ffa726]",
    dot: "bg-[#ef6c00]",
    badge: "bg-[#ef6c00]/15 text-[#e65100] dark:text-[#ffa726] border-[#ef6c00]/30",
  },
  mango: {
    borderLeft: "border-l-[#f09300]",
    bg: "bg-[#f09300]/10 dark:bg-[#f09300]/15",
    text: "text-[#e65100] dark:text-[#ffe082]",
    dot: "bg-[#f09300]",
    badge: "bg-[#f09300]/15 text-[#e65100] dark:text-[#ffe082] border-[#f09300]/30",
  },
  banana: {
    borderLeft: "border-l-[#f6bf26]",
    bg: "bg-[#f6bf26]/10 dark:bg-[#f6bf26]/15",
    text: "text-[#f57f17] dark:text-[#fff59d]",
    dot: "bg-[#f6bf26]",
    badge: "bg-[#f6bf26]/15 text-[#f57f17] dark:text-[#fff59d] border-[#f6bf26]/30",
  },
  sunflower: {
    borderLeft: "border-l-[#e2c222]",
    bg: "bg-[#e2c222]/10 dark:bg-[#e2c222]/15",
    text: "text-[#af9b00] dark:text-[#fff59d]",
    dot: "bg-[#e2c222]",
    badge: "bg-[#e2c222]/15 text-[#af9b00] dark:text-[#fff59d] border-[#e2c222]/30",
  },
  avocado: {
    borderLeft: "border-l-[#b5c425]",
    bg: "bg-[#b5c425]/10 dark:bg-[#b5c425]/15",
    text: "text-[#689f38] dark:text-[#c5e1a5]",
    dot: "bg-[#b5c425]",
    badge: "bg-[#b5c425]/15 text-[#689f38] dark:text-[#c5e1a5] border-[#b5c425]/30",
  },
  basil: {
    borderLeft: "border-l-[#0b8043]",
    bg: "bg-[#0b8043]/10 dark:bg-[#0b8043]/15",
    text: "text-[#1b5e20] dark:text-[#a5d6a7]",
    dot: "bg-[#0b8043]",
    badge: "bg-[#0b8043]/15 text-[#1b5e20] dark:text-[#a5d6a7] border-[#0b8043]/30",
  },
  sage: {
    borderLeft: "border-l-[#009688]",
    bg: "bg-[#009688]/10 dark:bg-[#009688]/15",
    text: "text-[#004d40] dark:text-[#80cbc4]",
    dot: "bg-[#009688]",
    badge: "bg-[#009688]/15 text-[#004d40] dark:text-[#80cbc4] border-[#009688]/30",
  },
  peacock: {
    borderLeft: "border-l-[#00897b]",
    bg: "bg-[#00897b]/10 dark:bg-[#00897b]/15",
    text: "text-[#004d40] dark:text-[#80cbc4]",
    dot: "bg-[#00897b]",
    badge: "bg-[#00897b]/15 text-[#004d40] dark:text-[#80cbc4] border-[#00897b]/30",
  },
  blueberry: {
    borderLeft: "border-l-[#039be5]",
    bg: "bg-[#039be5]/10 dark:bg-[#039be5]/15",
    text: "text-[#01579b] dark:text-[#81d4fa]",
    dot: "bg-[#039be5]",
    badge: "bg-[#039be5]/15 text-[#01579b] dark:text-[#81d4fa] border-[#039be5]/30",
  },
  periwinkle: {
    borderLeft: "border-l-[#7986cb]",
    bg: "bg-[#7986cb]/10 dark:bg-[#7986cb]/15",
    text: "text-[#303f9f] dark:text-[#c5cae9]",
    dot: "bg-[#7986cb]",
    badge: "bg-[#7986cb]/15 text-[#303f9f] dark:text-[#c5cae9] border-[#7986cb]/30",
  },
  cobalt: {
    borderLeft: "border-l-[#3f51b5]",
    bg: "bg-[#3f51b5]/10 dark:bg-[#3f51b5]/15",
    text: "text-[#1a237e] dark:text-[#9fa8da]",
    dot: "bg-[#3f51b5]",
    badge: "bg-[#3f51b5]/15 text-[#1a237e] dark:text-[#9fa8da] border-[#3f51b5]/30",
  },
  lavender: {
    borderLeft: "border-l-[#b39ddb]",
    bg: "bg-[#b39ddb]/15 dark:bg-[#b39ddb]/20",
    text: "text-[#512da8] dark:text-[#d1c4e9]",
    dot: "bg-[#b39ddb]",
    badge: "bg-[#b39ddb]/20 text-[#512da8] dark:text-[#d1c4e9] border-[#b39ddb]/40",
  },
  grape: {
    borderLeft: "border-l-[#9c27b0]",
    bg: "bg-[#9c27b0]/10 dark:bg-[#9c27b0]/15",
    text: "text-[#6a1b9a] dark:text-[#e1bee7]",
    dot: "bg-[#9c27b0]",
    badge: "bg-[#9c27b0]/15 text-[#6a1b9a] dark:text-[#e1bee7] border-[#9c27b0]/30",
  },
  cocoa: {
    borderLeft: "border-l-[#795548]",
    bg: "bg-[#795548]/10 dark:bg-[#795548]/15",
    text: "text-[#3e2723] dark:text-[#d7ccc8]",
    dot: "bg-[#795548]",
    badge: "bg-[#795548]/15 text-[#3e2723] dark:text-[#d7ccc8] border-[#795548]/30",
  },
  graphite: {
    borderLeft: "border-l-[#616161]",
    bg: "bg-[#616161]/10 dark:bg-[#616161]/15",
    text: "text-[#212121] dark:text-[#e0e0e0]",
    dot: "bg-[#616161]",
    badge: "bg-[#616161]/15 text-[#212121] dark:text-[#e0e0e0] border-[#616161]/30",
  },
  stone: {
    borderLeft: "border-l-[#a1887f]",
    bg: "bg-[#a1887f]/10 dark:bg-[#a1887f]/15",
    text: "text-[#4e342e] dark:text-[#d7ccc8]",
    dot: "bg-[#a1887f]",
    badge: "bg-[#a1887f]/15 text-[#4e342e] dark:text-[#d7ccc8] border-[#a1887f]/30",
  },
};

// Helper to resolve active hex color
export function getActiveColorHex(category?: string, colorKey?: string): string {
  if (colorKey) {
    const found = COLOR_SWATCHES.find((s) => s.key === colorKey);
    if (found) return found.colorHex;
  }
  const defaultColors: Record<string, string> = {
    Events: "#8e24aa",
    Tasks: "#ef6c00",
    Reminder: "#039be5",
    Holidays: "#0b8043",
    "Academic Breaks & Holidays": "#0b8043",
    "Board Review": "#00897b",
    "Comprehensive Review": "#3f51b5",
    "Diagnostic Drill": "#039be5",
    "Pre-Board Mock Exam": "#ef6c00",
    "Final Coaching & High-Yield": "#0b8043",
    "Remedial & Refresher Session": "#e61972",
    "Review & Mock Programs": "#00897b",
  };
  return defaultColors[category || "Events"] || "#00897b";
}

// Maps category or colorKey to consistent color style
export function getEventColor(category?: string, colorKey?: string): EventColorStyle {
  if (colorKey && CATEGORY_COLORS[colorKey]) {
    return CATEGORY_COLORS[colorKey];
  }

  const categoryMap: Record<string, string> = {
    Events: "purple",
    Tasks: "orange",
    Reminder: "blue",
    Holidays: "green",
    "Academic Breaks & Holidays": "green",
    "Board Review": "teal",
    "Comprehensive Review": "indigo",
    "Diagnostic Drill": "blue",
    "Pre-Board Mock Exam": "orange",
    "Final Coaching & High-Yield": "green",
    "Remedial & Refresher Session": "rose",
    "Review & Mock Programs": "teal",
  };

  const key = categoryMap[category || "Events"] || "teal";
  if (CATEGORY_COLORS[key]) {
    return CATEGORY_COLORS[key];
  }
  return CATEGORY_COLORS.teal;
}
