import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export const NOTIFICATION_TYPE_FILTERS = [
  { value: "ALL", label: "ALL" },
  { value: "QUESTION_APPROVED", label: "Questions" },
  { value: "STUDENT_ASSIGNED", label: "Guidance" },
  { value: "SYSTEM_UPDATE", label: "System" },
  { value: "INFO", label: "INFO" },
] as const;

export type NotificationTypeFilter = (typeof NOTIFICATION_TYPE_FILTERS)[number]["value"];

interface NotificationsFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  unreadOnly: boolean;
  onToggleUnreadOnly: () => void;
  unreadCount: number;
  selectedType: string;
  onSelectType: (type: string) => void;
}

export function NotificationsFilterBar({
  searchTerm,
  onSearchChange,
  unreadOnly,
  onToggleUnreadOnly,
  unreadCount,
  selectedType,
  onSelectType,
}: NotificationsFilterBarProps) {
  return (
    <Card className="bg-card border border-border rounded-xl shadow-2xs overflow-hidden p-2.5 px-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Search Box */}
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-3 h-8 text-xs bg-muted/30 border-border rounded-lg focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-0.5 sm:pb-0">
          <button
            type="button"
            onClick={onToggleUnreadOnly}
            className={`px-2.5 h-7 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
              unreadOnly
                ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                : "bg-muted/40 text-muted-foreground border-border hover:bg-accent hover:text-foreground"
            }`}
          >
            Unread ({unreadCount})
          </button>

          <div className="h-3.5 w-px bg-border mx-1 hidden sm:block" />

          {NOTIFICATION_TYPE_FILTERS.map((t) => {
            const isActive = selectedType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => onSelectType(t.value)}
                className={`px-2.5 h-7 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-foreground text-background shadow-2xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default NotificationsFilterBar;
