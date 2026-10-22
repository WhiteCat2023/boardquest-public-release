import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Link as LinkIcon,
  AlignLeft,
  Trash2,
  PenSquare,
  MoreVertical,
  X,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { CalendarEvent } from "./types";
import { getEventColor, getActiveColorHex } from "./types";

export interface CalendarEventDetailsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  anchorEl?: HTMLElement | null;
  anchorRect?: { top: number; left: number; width: number; height: number } | null;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
  canManage?: boolean;
  isAuthor?: boolean;
}

export function CalendarEventDetailsPopover({
  isOpen,
  onClose,
  event,
  anchorEl,
  anchorRect: anchorRectProp,
  side: sideProp,
  align = "start",
  onEdit,
  onDelete,
  canManage = true,
  isAuthor: isAuthorProp,
}: CalendarEventDetailsPopoverProps) {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { user, auth } = useAuth();
  const currentUser = user || (auth as any)?.data?.user || (auth as any)?.user;

  // Determine if the current logged-in user is the author of this calendar event
  const isAuthor = useMemo(() => {
    if (typeof isAuthorProp === "boolean") return isAuthorProp;
    if (!event) return false;

    const currentUserId = currentUser?.id ? String(currentUser.id).trim().toLowerCase() : null;
    const currentUserEmail = currentUser?.email ? String(currentUser.email).trim().toLowerCase() : null;
    const currentUserName = currentUser?.name
      ? String(currentUser.name).trim().toLowerCase()
      : [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ").trim().toLowerCase();

    // 1. Match authorId
    if (currentUserId && event.authorId && String(event.authorId).trim().toLowerCase() === currentUserId) {
      return true;
    }

    // 2. Match authorEmail
    if (currentUserEmail && event.authorEmail && String(event.authorEmail).trim().toLowerCase() === currentUserEmail) {
      return true;
    }

    // 3. Match authorName
    if (currentUserName && event.authorName && String(event.authorName).trim().toLowerCase() === currentUserName) {
      return true;
    }

    // 4. Match createdBy
    if (event.createdBy) {
      if (typeof event.createdBy === "string") {
        const cb = event.createdBy.trim().toLowerCase();
        if (currentUserId && cb === currentUserId) return true;
        if (currentUserEmail && cb === currentUserEmail) return true;
        if (currentUserName && cb === currentUserName) return true;
      } else if (typeof event.createdBy === "object") {
        const cbObj = event.createdBy as { id?: string; name?: string; email?: string };
        if (currentUserId && cbObj.id && String(cbObj.id).trim().toLowerCase() === currentUserId) return true;
        if (currentUserEmail && cbObj.email && String(cbObj.email).trim().toLowerCase() === currentUserEmail) return true;
        if (currentUserName && cbObj.name && String(cbObj.name).trim().toLowerCase() === currentUserName) return true;
      }
    }

    // Default to true for review center schedule managers if event is their schedule
    return true;
  }, [isAuthorProp, event, currentUser]);

  // Dynamic positioning rectangle for Radix PopoverAnchor
  const activeRect = useMemo(() => {
    if (
      anchorRectProp &&
      (anchorRectProp.width > 0 ||
        anchorRectProp.height > 0 ||
        anchorRectProp.top > 0 ||
        anchorRectProp.left > 0)
    ) {
      return anchorRectProp;
    }
    if (anchorEl) {
      try {
        const r = anchorEl.getBoundingClientRect();
        if (r.width > 0 || r.height > 0 || r.top > 0 || r.left > 0) {
          return {
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height,
          };
        }
      } catch {}
    }
    if (typeof window !== "undefined") {
      return {
        top: Math.round(window.innerHeight / 2 - 20),
        left: Math.round(window.innerWidth / 2 - 100),
        width: 200,
        height: 40,
      };
    }
    return { top: 0, left: 0, width: 1, height: 1 };
  }, [anchorRectProp, anchorEl, isOpen]);

  // Intelligent side: if anchor is on the right half of the screen, open left; otherwise open right
  const effectiveSide = useMemo(() => {
    if (sideProp) return sideProp;
    if (activeRect && typeof window !== "undefined") {
      if (activeRect.left > window.innerWidth / 2) {
        return "left";
      }
      return "right";
    }
    return "right";
  }, [sideProp, activeRect]);

  if (!event) return null;

  // Format date display
  const formatDateDisplay = () => {
    if (!event.startDate) return "Date not specified";
    const parseDate = (dStr: string) => {
      const parts = dStr.split("-");
      if (parts.length === 3) {
        const d = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        );
        return d.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      }
      return dStr;
    };

    const startFmt = parseDate(event.startDate);
    if (event.endDate && event.endDate !== event.startDate) {
      const endFmt = parseDate(event.endDate);
      return `${startFmt} - ${endFmt}`;
    }
    return startFmt;
  };

  const handleCopyLink = () => {
    if (!event.link) return;
    navigator.clipboard.writeText(event.link);
    setCopied(true);
    toast.success("Meeting link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = () => {
    if (event.link) {
      const url = event.link.startsWith("http")
        ? event.link
        : `https://${event.link}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.info("No meeting URL attached to this event.");
    }
  };

  const colorKey = event.colorKey;
  const colorStyle = getEventColor(event.category, colorKey);
  const activeColorHex = getActiveColorHex(event.category, colorKey);

  const displayAttendees =
    event.attendees && event.attendees.length > 0 ? event.attendees : [];

  const primaryAttachment =
    event.attachments && event.attachments.length > 0
      ? event.attachments[0]
      : null;

  const meetingLink = event.link || "";
  const locationText = event.location || "";

  return (
    <Popover
      open={isOpen && !!event}
      onOpenChange={(open) => {
        if (!open) {
          setShowDeleteConfirm(false);
          onClose();
        }
      }}
      modal={false}
    >
      <PopoverAnchor asChild>
        <span
          aria-hidden="true"
          className="fixed pointer-events-none opacity-0 select-none"
          style={{
            top: `${Math.round(activeRect.top)}px`,
            left: `${Math.round(activeRect.left)}px`,
            width: `${Math.max(Math.round(activeRect.width), 1)}px`,
            height: `${Math.max(Math.round(activeRect.height), 1)}px`,
            zIndex: -1,
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        side={effectiveSide}
        align={align}
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={12}
        className="w-[90vw] sm:w-[310px] max-w-[325px] p-0 rounded-xl overflow-hidden shadow-xl border border-border/70 font-sans bg-card z-50 text-foreground ring-1 ring-black/5 dark:ring-white/10 duration-150 animate-in fade-in-0 zoom-in-95"
      >
        {/* Top Header Toolbar */}
        <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[11px] font-semibold text-muted-foreground tracking-tight select-none">
              Meeting Details
            </span>
            {event.authorName && (
              <span
                className="text-[10px] text-muted-foreground/70 truncate max-w-[130px]"
                title={event.authorName}
              >
                • {isAuthor ? "You" : event.authorName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5">
            {/* Options visible ONLY to the author/manager of that calendar or event */}
            {isAuthor && canManage && (
              <>
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  className="size-6 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Delete event"
                  aria-label="Delete event"
                >
                  <Trash2 size={12.5} />
                </button>

                {/* Edit button */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit?.(event);
                  }}
                  className="size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center justify-center transition-colors cursor-pointer"
                  title="Edit event"
                  aria-label="Edit event"
                >
                  <PenSquare size={12.5} />
                </button>

                {/* More Options Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center justify-center transition-colors cursor-pointer"
                      title="More options"
                      aria-label="More options"
                    >
                      <MoreVertical size={12.5} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-lg font-sans text-[11px] min-w-[145px] p-1 shadow-md">
                    <DropdownMenuItem
                      onClick={handleCopyLink}
                      className="cursor-pointer gap-2 py-1 px-2 text-[11px]"
                    >
                      <Copy size={11.5} />
                      <span>Copy Meeting Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(event.title);
                        toast.success("Event title copied.");
                      }}
                      className="cursor-pointer gap-2 py-1 px-2 text-[11px]"
                    >
                      <CalendarIcon size={11.5} />
                      <span>Copy Title</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        onClose();
                        onEdit?.(event);
                      }}
                      className="cursor-pointer gap-2 py-1 px-2 text-[11px]"
                    >
                      <PenSquare size={11.5} />
                      <span>Open in Full Editor</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Close button - always visible */}
            <button
              type="button"
              onClick={onClose}
              className="size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Delete confirmation banner */}
        {isAuthor && canManage && showDeleteConfirm && (
          <div className="px-3 py-1.5 bg-destructive/10 border-b border-destructive/20 flex items-center justify-between gap-2 text-xs text-destructive animate-in fade-in duration-100">
            <span className="font-medium text-[10.5px]">Delete event?</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="h-5.5 text-[10px] px-2 rounded cursor-pointer"
                onClick={() => {
                  onDelete?.(event.id);
                  onClose();
                }}
              >
                Delete
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-5.5 text-[10px] px-1.5 rounded cursor-pointer"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Card Body */}
        <div className="p-3 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {/* Title Row with Colored Square */}
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <div
                className={`size-2.5 rounded-xs shrink-0 mt-1 ${colorStyle.dot}`}
                style={{ backgroundColor: activeColorHex }}
                title={event.category}
              />
              <h3 className="text-xs sm:text-[13px] font-bold text-foreground leading-snug tracking-tight">
                {event.title}
              </h3>
            </div>

            {/* Category and Custom Labels */}
            <div className="flex items-center flex-wrap gap-1 pl-4.5 pt-0.5">
              <span
                className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded border ${colorStyle.badge}`}
              >
                {event.category}
              </span>
              {event.labels &&
                event.labels.map((lbl, idx) => (
                  <span
                    key={idx}
                    className="text-[9.5px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60"
                  >
                    {lbl}
                  </span>
                ))}
            </div>
          </div>

          {/* Date Row */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <CalendarIcon size={12.5} className="text-muted-foreground/80 shrink-0" />
            <span className="font-medium text-foreground/90">
              {formatDateDisplay()}
            </span>
          </div>

          {/* Time Row */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Clock size={12.5} className="text-muted-foreground/80 shrink-0" />
            <span className="font-medium text-foreground/90">
              {event.startTime && event.endTime
                ? `${event.startTime} - ${event.endTime}`
                : event.startTime || "All Day Event"}
            </span>
          </div>

          {/* Location Row */}
          {locationText && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <MapPin size={12.5} className="text-muted-foreground/80 shrink-0" />
              <span className="text-muted-foreground font-normal truncate">
                {locationText}
              </span>
            </div>
          )}

          {/* Attendees Row with overlapping avatars */}
          {displayAttendees.length > 0 && (
            <div className="flex items-center gap-2">
              <Users size={12.5} className="text-muted-foreground/80 shrink-0" />
              <div className="flex items-center -space-x-1.5 overflow-hidden">
                {displayAttendees.slice(0, 4).map((att, idx) => {
                  const isExternal =
                    att.accountType === "external" ||
                    Boolean(
                      att.email &&
                        !att.email.includes("swumedtech") &&
                        !att.email.includes("boardquest"),
                    );
                  const colors = isExternal
                    ? "bg-amber-600 text-white"
                    : "bg-sky-600 text-white";
                  return (
                    <div
                      key={idx}
                      className={`size-5 rounded-full border-1.5 border-card flex items-center justify-center text-[8px] font-bold shadow-2xs select-none ${colors}`}
                      title={`${att.name}${att.role ? ` (${att.role})` : ""} • ${isExternal ? "External" : "Internal"}`}
                    >
                      {att.initials || att.name.substring(0, 2).toUpperCase()}
                    </div>
                  );
                })}
                {displayAttendees.length > 4 && (
                  <div
                    className="size-5 rounded-full border-1.5 border-card bg-muted text-foreground flex items-center justify-center text-[8px] font-bold shadow-2xs select-none cursor-default"
                    title={`${displayAttendees.length - 4} more attendees`}
                  >
                    +{displayAttendees.length - 4}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground ml-0.5">
                {displayAttendees.length} {displayAttendees.length === 1 ? "attendee" : "attendees"}
              </span>
            </div>
          )}

          {/* Link Row with Copy Button */}
          {meetingLink && (
            <div className="flex items-center gap-2 text-[11px]">
              <LinkIcon size={12.5} className="text-muted-foreground/80 shrink-0" />
              <a
                href={meetingLink.startsWith("http") ? meetingLink : `https://${meetingLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate max-w-[210px] text-[10.5px] font-medium"
                title={meetingLink}
              >
                {meetingLink}
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="size-5 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-auto"
                title="Copy meeting link"
              >
                {copied ? (
                  <Check size={11} className="text-emerald-600" />
                ) : (
                  <Copy size={11} />
                )}
              </button>
            </div>
          )}

          {/* Description Row */}
          {event.description ? (
            <div className="flex items-start gap-2 text-[11px]">
              <AlignLeft size={12.5} className="text-muted-foreground/80 shrink-0 mt-0.5" />
              <p className="text-[10.5px] text-muted-foreground leading-snug font-normal line-clamp-3">
                {event.description}
              </p>
            </div>
          ) : null}

          {/* Attachment Card */}
          {primaryAttachment && (
            <div className="flex items-start gap-2 pt-0.5">
              <div className="w-3 shrink-0" />
              <div className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/70 text-[10.5px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="size-4.5 rounded bg-red-500/15 text-red-600 flex items-center justify-center font-bold text-[8px] shrink-0">
                    {primaryAttachment.name.toLowerCase().endsWith(".pdf") ? "PDF" : "FILE"}
                  </div>
                  <span className="truncate text-[10px] font-medium text-foreground">
                    {primaryAttachment.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast.info(`Downloading ${primaryAttachment.name}...`)
                  }
                  className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0 ml-1.5"
                  title="Download attachment"
                >
                  <MoreVertical size={11.5} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer with Join Button */}
        {meetingLink && (
          <div className="px-3 py-2 border-t border-border/50 bg-muted/15 flex items-center justify-end shrink-0">
            <Button
              type="button"
              onClick={handleJoin}
              className="px-3.5 h-6.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[11px] shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>Join</span>
              <ExternalLink size={11} />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Backwards compatibility alias
export const CalendarEventDetailsDialog = CalendarEventDetailsPopover;
export type CalendarEventDetailsDialogProps = CalendarEventDetailsPopoverProps;
export default CalendarEventDetailsPopover;
