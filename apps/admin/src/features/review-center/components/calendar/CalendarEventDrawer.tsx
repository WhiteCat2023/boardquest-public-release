import React, { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Link as LinkIcon,
  Plus,
  Paperclip,
  X,
  FileText,
  Trash2,
  Sparkles,
  ChevronDown,
  Check,
  Tag,
  AlertTriangle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useRoleFlags } from "@/hooks/useRoleFlags";
import { useCalendarStore } from "./calendarStore";
import type { CalendarEvent, CalendarEventAttachment } from "./types";
import { COLOR_SWATCHES, getActiveColorHex } from "./types";
import {
  CalendarAttendeeSelect,
  type CalendarAttendeeItem,
} from "./CalendarAttendeeSelect";
import { CalendarColorLabelPicker } from "./CalendarColorLabelPicker";

interface CalendarEventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialEvent?: CalendarEvent | null;
  defaultDate?: Date;
  defaultTime?: string;
  onSave: (eventData: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: string) => void;
  canManage?: boolean;
}

const BASE_CATEGORY_OPTIONS = [
  { value: "Events", label: "Events", color: "purple" },
  { value: "Tasks", label: "Tasks", color: "orange" },
  { value: "Reminder", label: "Reminder", color: "blue" },
  { value: "Holidays", label: "Academic Breaks & Holidays", color: "green" },
  { value: "Board Review", label: "Review & Mock Programs", color: "teal" },
  { value: "Game Deadline", label: "Game Deadline", color: "rose" },
];

const CONFERENCE_TYPE_OPTIONS = [
  "In-Person",
  "Online (Google Meet / Zoom)",
  "Hybrid",
  "None",
];

const TIME_OPTIONS = [
  "06:00 AM",
  "06:30 AM",
  "07:00 AM",
  "07:30 AM",
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:15 AM",
  "11:30 AM",
  "12:00 PM",
  "12:15 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "09:30 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
  "11:30 PM",
];

const LOCATION_OPTIONS = [
  "Main Campus Review Room 101",
  "Review Center Hall A",
  "Engineering Lecture Hall B",
  "BoardQuest Studio 2",
  "Online / Google Meet",
];

export function CalendarEventDrawer({
  isOpen,
  onClose,
  initialEvent,
  defaultDate,
  defaultTime,
  onSave,
  onDelete,
  canManage = true,
}: CalendarEventDrawerProps) {
  const isEditing = Boolean(initialEvent?.id);
  const { isStaff } = useRoleFlags();
  const { customEvents } = useCalendarStore();

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Events");
  const [colorKey, setColorKey] = useState<string | undefined>(undefined);
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabelInput, setNewLabelInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [location, setLocation] = useState("");
  const [attendees, setAttendees] = useState<CalendarAttendeeItem[]>([]);
  const [link, setLink] = useState("");
  const [conferenceType, setConferenceType] = useState("In-Person");
  const [description, setDescription] = useState("");
  const [solutionNotes, setSolutionNotes] = useState("");
  const [showSolutionInput, setShowSolutionInput] = useState(false);
  const [attachments, setAttachments] = useState<CalendarEventAttachment[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Existing Game Deadline conflict prompt state
  const [showExistingConflictModal, setShowExistingConflictModal] = useState(false);
  const [targetDeadlineId, setTargetDeadlineId] = useState<string | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Find if an existing Game Deadline event already exists (excluding the event currently being edited)
  const existingGameDeadline = React.useMemo(() => {
    return customEvents.find(
      (e) =>
        e.category === "Game Deadline" &&
        e.id !== initialEvent?.id
    );
  }, [customEvents, initialEvent?.id]);

  // Restrict Game Deadline category selection to SuperAdmin, Dean, and TeamLead only
  const categoryOptions = React.useMemo(() => {
    return BASE_CATEGORY_OPTIONS.filter((opt) => {
      if (opt.value === "Game Deadline") {
        return isStaff;
      }
      return true;
    });
  }, [isStaff]);

  // Game Deadline is read-only for Teachers and other non-staff roles
  const isGameDeadline = category === "Game Deadline" || initialEvent?.category === "Game Deadline";
  const canUserManage = canManage && (!isGameDeadline || isStaff);

  // Ensure current startTime and endTime are in the options list so Radix Select can always match and select them
  const availableTimeOptions = React.useMemo(() => {
    const list = [...TIME_OPTIONS];
    if (startTime && !list.includes(startTime)) {
      list.push(startTime);
    }
    if (endTime && !list.includes(endTime)) {
      list.push(endTime);
    }
    return list;
  }, [startTime, endTime]);

  // Hidden file input for attachments
  const fileInputRef = useRef<HTMLInputElement>(null);

  const COLOR_KEY_BY_CATEGORY: Record<string, string> = {
    Events: "purple",
    Tasks: "orange",
    Reminder: "blue",
    Holidays: "green",
    "Academic Breaks & Holidays": "green",
    "Board Review": "teal",
    "Review & Mock Programs": "teal",
    "Game Deadline": "rose",
  };

  // Helper date formatter
  const formatDateToYMD = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  const formatDisplayDate = (ymd: string) => {
    if (!ymd) return "DD/MM/YY";
    const parts = ymd.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
    }
    return ymd;
  };

  // Populate form when modal opens or initialEvent / defaultDate changes
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setShowDeleteConfirm(false);
      setShowExistingConflictModal(false);
      setTargetDeadlineId(null);
      setPendingSubmit(false);
      setNewLabelInput("");

      if (initialEvent) {
        setTitle(initialEvent.title || "");
        setCategory(initialEvent.category || "Events");
        setColorKey(initialEvent.colorKey || undefined);
        setLabels(initialEvent.labels || []);
        setStartDate(initialEvent.startDate || "");
        setEndDate(initialEvent.endDate || initialEvent.startDate || "");
        setStartTime(initialEvent.startTime || "09:00 AM");
        setEndTime(initialEvent.endTime || "10:00 AM");
        setLocation(initialEvent.location || "");
        setLink(initialEvent.link || "");
        setConferenceType(initialEvent.conferenceType || "In-Person");
        setDescription(initialEvent.description || "");
        setSolutionNotes(initialEvent.solutionNotes || "");
        setShowSolutionInput(Boolean(initialEvent.solutionNotes));

        const normalizedAttendees: CalendarAttendeeItem[] = (
          initialEvent.attendees || []
        ).map((a: any) => {
          if (typeof a === "string") {
            const isEmail = a.includes("@");
            return {
              name: a,
              email: isEmail ? a.trim().toLowerCase() : a,
              initials: a.substring(0, 2).toUpperCase(),
              accountType:
                isEmail &&
                !a.includes("swumedtech") &&
                !a.includes("boardquest")
                  ? "external"
                  : "internal",
            };
          }
          const email = (
            a.email || (a.name?.includes("@") ? a.name : "")
          )
            .trim()
            .toLowerCase();
          return {
            id: a.id,
            name: a.name || email,
            email,
            initials:
              a.initials ||
              (a.name || email).substring(0, 2).toUpperCase(),
            role: a.role,
            accountType:
              a.accountType ||
              (email &&
              !email.includes("swumedtech") &&
              !email.includes("boardquest")
                ? "external"
                : "internal"),
            organization: a.organization,
            avatarUrl: a.avatarUrl,
          };
        });
        setAttendees(normalizedAttendees);
        setAttachments(initialEvent.attachments || []);
      } else {
        const initialDateStr = defaultDate
          ? formatDateToYMD(defaultDate)
          : formatDateToYMD(new Date());
        setTitle("");
        setCategory("Events");
        setColorKey(undefined);
        setLabels([]);
        setStartDate(initialDateStr);
        setEndDate(initialDateStr);
        setStartTime(defaultTime || "09:00 AM");
        setEndTime(defaultTime ? "10:00 AM" : "10:00 AM");
        setLocation("");
        setLink("");
        setConferenceType("In-Person");
        setDescription("");
        setSolutionNotes("");
        setShowSolutionInput(false);
        setAttendees([]);
        setAttachments([]);
      }
    }
  }, [isOpen, initialEvent, defaultDate, defaultTime]);

  const handleCategoryChange = (newCat: string) => {
    if (newCat === "Game Deadline") {
      if (!isStaff) return;
      if (existingGameDeadline && !targetDeadlineId) {
        setShowExistingConflictModal(true);
        return;
      }
    }
    setCategory(newCat);
  };

  const handleConfirmChangeCurrentDeadline = () => {
    if (existingGameDeadline) {
      setCategory("Game Deadline");
      setTargetDeadlineId(existingGameDeadline.id);
      setShowExistingConflictModal(false);

      if (pendingSubmit) {
        setPendingSubmit(false);
        executeSave(existingGameDeadline.id, "Game Deadline");
      }
    }
  };

  const handleCancelConflict = () => {
    setShowExistingConflictModal(false);
    setPendingSubmit(false);
    if (category === "Game Deadline" && !targetDeadlineId) {
      setCategory("Events");
    }
  };

  const handleAddLabel = (customText?: string) => {
    const val = (customText ?? newLabelInput).trim();
    if (!val) return;
    if (!labels.includes(val)) {
      setLabels([...labels, val]);
    }
    if (!customText) {
      setNewLabelInput("");
    }
  };

  const handleRemoveLabel = (index: number) => {
    setLabels(labels.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: CalendarEventAttachment[] = Array.from(files).map(
      (file) => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      })
    );

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const executeSave = (saveId?: string, overrideCategory?: string) => {
    const activeCategory = overrideCategory || category;
    const attendeeObjs = attendees.map((att) => ({
      name: att.name,
      email: att.email,
      initials: att.initials || att.name.substring(0, 2).toUpperCase(),
      role: att.role,
      accountType: att.accountType,
      organization: att.organization,
      avatarUrl: att.avatarUrl,
    }));

    onSave({
      id: saveId,
      title: title.trim(),
      category: activeCategory,
      colorKey: colorKey || (activeCategory === "Game Deadline" ? "rose" : undefined),
      labels: labels.filter(Boolean),
      startDate,
      endDate: endDate || startDate,
      startTime,
      endTime,
      location,
      link,
      conferenceType,
      description: description.trim(),
      solutionNotes: solutionNotes.trim(),
      attendees: attendeeObjs,
      attachments,
      authorId: initialEvent?.authorId,
      authorName: initialEvent?.authorName,
      authorEmail: initialEvent?.authorEmail,
      createdBy: initialEvent?.createdBy,
    });

    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!canUserManage) {
      setErrorMsg("You do not have permission to modify this schedule.");
      return;
    }

    if (!title.trim()) {
      setErrorMsg("Please enter an event name.");
      return;
    }
    if (!startDate) {
      setErrorMsg("Please select a start date.");
      return;
    }

    if (category === "Game Deadline") {
      if (!isStaff) {
        setErrorMsg("Only Superadmin, Dean, and Teamlead can set a Game Deadline schedule.");
        return;
      }

      if (existingGameDeadline && !targetDeadlineId && existingGameDeadline.id !== initialEvent?.id) {
        setPendingSubmit(true);
        setShowExistingConflictModal(true);
        return;
      }
    }

    executeSave(targetDeadlineId || initialEvent?.id);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-full sm:max-w-[430px] md:max-w-[450px] p-0 flex flex-col h-full bg-card shadow-2xl border-r border-border/80 font-sans z-50 overflow-hidden"
      >
        {/* Drawer Header */}
        <SheetHeader className="px-5 py-4 border-b border-border/70 flex flex-row items-center justify-between shrink-0 bg-card">
          <SheetTitle className="text-sm sm:text-base font-bold text-foreground tracking-tight">
            {isEditing ? "Edit Event" : "Create Event"}
          </SheetTitle>

          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </Button>
          </SheetClose>
        </SheetHeader>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Event Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground/80 tracking-tight">
                Event Name
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter here"
                className="h-9 rounded-xl text-xs bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary/30"
                disabled={!canUserManage}
                autoFocus
              />
            </div>

            {/* Start Date & End Date (2 Columns) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-foreground/80 tracking-tight">
                  Start Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={!canUserManage}
                      className="w-full h-9 px-3 rounded-xl border border-border/80 bg-background text-xs flex items-center justify-between hover:bg-muted/40 transition-colors cursor-pointer text-foreground text-left"
                    >
                      <span className={startDate ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {formatDisplayDate(startDate)}
                      </span>
                      <CalendarIcon size={14} className="text-muted-foreground shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 rounded-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate ? new Date(`${startDate}T00:00:00`) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const str = formatDateToYMD(date);
                          setStartDate(str);
                          if (!endDate || endDate < str) {
                            setEndDate(str);
                          }
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-foreground/80 tracking-tight">
                  End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={!canUserManage}
                      className="w-full h-9 px-3 rounded-xl border border-border/80 bg-background text-xs flex items-center justify-between hover:bg-muted/40 transition-colors cursor-pointer text-foreground text-left"
                    >
                      <span className={endDate ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {formatDisplayDate(endDate)}
                      </span>
                      <CalendarIcon size={14} className="text-muted-foreground shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 rounded-2xl" align="end">
                    <Calendar
                      mode="single"
                      selected={endDate ? new Date(`${endDate}T00:00:00`) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setEndDate(formatDateToYMD(date));
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Start Time & End Time (2 Columns) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Start Time */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-foreground/80 tracking-tight flex items-center gap-1.5">
                  <Clock size={12} className="text-muted-foreground" />
                  <span>Start Time</span>
                </label>
                <Select value={startTime} onValueChange={setStartTime} disabled={!canUserManage}>
                  <SelectTrigger className="w-full h-9 rounded-xl border-border/80 bg-background text-xs font-normal">
                    <SelectValue placeholder="Start Time" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    className="max-h-48 w-[var(--radix-select-trigger-width)] min-w-[130px] rounded-xl font-sans text-xs shadow-lg"
                  >
                    {availableTimeOptions.map((time) => (
                      <SelectItem key={time} value={time} className="text-xs cursor-pointer">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* End Time */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-foreground/80 tracking-tight flex items-center gap-1.5">
                  <Clock size={12} className="text-muted-foreground" />
                  <span>End Time</span>
                </label>
                <Select value={endTime} onValueChange={setEndTime} disabled={!canUserManage}>
                  <SelectTrigger className="w-full h-9 rounded-xl border-border/80 bg-background text-xs font-normal">
                    <SelectValue placeholder="End Time" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    className="max-h-48 w-[var(--radix-select-trigger-width)] min-w-[130px] rounded-xl font-sans text-xs shadow-lg"
                  >
                    {availableTimeOptions.map((time) => (
                      <SelectItem key={time} value={time} className="text-xs cursor-pointer">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground/80 tracking-tight">
                Location
              </label>
              <div className="relative">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Choose Location"
                  className="h-9 rounded-xl text-xs bg-background border-border/80 pl-8"
                  disabled={!canUserManage}
                />
                <MapPin
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
                />
              </div>
            </div>

            {/* Required Attendees (Searchable Dropdown with Internal & External Categorization) */}
            <CalendarAttendeeSelect
              attendees={attendees}
              onChange={setAttendees}
              canManage={canUserManage}
            />

            {/* Link */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground/80 tracking-tight">
                Link
              </label>
              <div className="relative">
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Enter Link"
                  className="h-9 rounded-xl text-xs bg-background border-border/80 pl-8"
                  disabled={!canUserManage}
                />
                <LinkIcon
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
                />
              </div>
            </div>

            {/* Category Type & Highlight Color (Google Calendar Style, Reference Images 2 & 3) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-foreground/80 tracking-tight">
                  Category & Color
                </label>
                {labels.length > 0 && (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Label: {labels[0]}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    value={category}
                    onValueChange={handleCategoryChange}
                    disabled={!canUserManage}
                  >
                    <SelectTrigger className="w-full h-9 rounded-xl border-border/80 bg-background text-xs font-normal">
                      <SelectValue placeholder="Choose Category Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-sans text-xs">
                      {categoryOptions.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="text-xs cursor-pointer"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Google Calendar-Style Color & Label Picker Trigger [ 🔵 ▼ ] (Reference Image 3) */}
                <CalendarColorLabelPicker
                  colorKey={colorKey}
                  labels={labels}
                  category={category}
                  disabled={!canUserManage}
                  onChangeColor={(newColor) => setColorKey(newColor)}
                  onChangeLabels={(newLabels) => setLabels(newLabels)}
                />
              </div>

              {/* Active Label Pill Chip if set */}
              {labels.length > 0 && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Active Label:
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/60 text-foreground text-[10.5px] font-medium border border-border/70 shadow-2xs">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: getActiveColorHex(category, colorKey),
                      }}
                    />
                    <span>{labels[0]}</span>
                    {canUserManage && (
                      <button
                        type="button"
                        onClick={() => setLabels([])}
                        className="text-muted-foreground hover:text-destructive cursor-pointer ml-0.5"
                        title="Remove label"
                        aria-label="Remove label"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Conference Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground/80 tracking-tight">
                Conference Type
              </label>
              <Select
                value={conferenceType}
                onValueChange={setConferenceType}
                disabled={!canUserManage}
              >
                <SelectTrigger className="w-full h-9 rounded-xl border-border/80 bg-background text-xs font-normal">
                  <SelectValue placeholder="Choose Conference Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-sans text-xs">
                  {CONFERENCE_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type} className="text-xs cursor-pointer">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground/80 tracking-tight">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write Here..."
                rows={3}
                className="rounded-xl text-xs bg-background border-border/80 resize-none focus-visible:ring-1 focus-visible:ring-primary/30"
                disabled={!canUserManage}
              />
            </div>

            {/* Add Solution Notes if toggled */}
            {showSolutionInput && (
              <div className="space-y-1.5 p-3 rounded-xl bg-accent/40 border border-border/60 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-foreground/80 tracking-tight flex items-center gap-1.5">
                    <Sparkles size={12} className="text-primary" />
                    <span>Solution & Review Notes</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSolutionInput(false);
                      setSolutionNotes("");
                    }}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
                <Textarea
                  value={solutionNotes}
                  onChange={(e) => setSolutionNotes(e.target.value)}
                  placeholder="Add instructions, review tips, or solution hints..."
                  rows={2}
                  className="rounded-xl text-xs bg-background border-border/80 resize-none"
                  disabled={!canUserManage}
                />
              </div>
            )}

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-foreground/80 tracking-tight">
                  Attachments ({attachments.length})
                </label>
                <div className="space-y-1">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/60 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={13} className="text-primary shrink-0" />
                        <span className="truncate text-[11px] font-medium text-foreground">
                          {att.name}
                        </span>
                        {att.size && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            ({att.size})
                          </span>
                        )}
                      </div>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-muted-foreground hover:text-destructive cursor-pointer ml-1"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Row: 📎 Add Attachment & + Add Solution */}
            {canUserManage && (
              <div className="flex items-center gap-4 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <Paperclip size={13} />
                  <span>Add Attachment</span>
                </button>

                {!showSolutionInput && (
                  <button
                    type="button"
                    onClick={() => setShowSolutionInput(true)}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    <Plus size={13} />
                    <span>Add Solution</span>
                  </button>
                )}
              </div>
            )}

            {/* Delete Confirmation Box (when in edit mode) */}
            {isEditing && showDeleteConfirm && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 space-y-2 mt-2">
                <p className="text-xs text-destructive font-medium">
                  Are you sure you want to delete this event? This action cannot be undone.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (initialEvent?.id && onDelete) {
                        onDelete(initialEvent.id);
                        onClose();
                      }
                    }}
                    className="h-7 text-xs rounded-lg"
                  >
                    Confirm Delete
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-7 text-xs rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Sticky Footer */}
          <div className="border-t border-border/70 p-4 bg-card/95 backdrop-blur-xs flex items-center gap-2.5 shrink-0">
            {canUserManage && (
              <Button
                type="submit"
                className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-xs cursor-pointer"
              >
                {isEditing ? "Save Changes" : "Create"}
              </Button>
            )}

            {isEditing && canUserManage ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="h-9 px-3 rounded-xl border-border text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-medium cursor-pointer"
              >
                <Trash2 size={14} className="mr-1" />
                <span>Delete</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-9 px-4 rounded-xl border-border text-foreground hover:bg-accent text-xs font-medium cursor-pointer"
              >
                More Options
              </Button>
            )}
          </div>
        </form>
      </SheetContent>

      {/* Existing Game Deadline Conflict Prompt */}
      <AlertDialog
        open={showExistingConflictModal}
        onOpenChange={(open) => {
          if (!open) handleCancelConflict();
        }}
      >
        <AlertDialogContent className="max-w-md rounded-2xl p-5">
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5 text-rose-600 mb-1">
              <div className="size-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
              <AlertDialogTitle className="text-sm font-bold text-foreground">
                Existing Game Deadline Found
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              There is already an existing Game Deadline scheduled:{" "}
              <strong className="text-foreground font-semibold">
                &ldquo;{existingGameDeadline?.title}&rdquo;
              </strong>{" "}
              on{" "}
              <strong className="text-foreground font-semibold">
                {existingGameDeadline?.startDate}
                {existingGameDeadline?.startTime
                  ? ` at ${existingGameDeadline.startTime}`
                  : ""}
              </strong>
              . Only one Game Deadline can be active at a time. Do you want to change the current one?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              onClick={handleCancelConflict}
              className="h-8 text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmChangeCurrentDeadline}
              className="h-8 text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              Change Current One
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

export default CalendarEventDrawer;
