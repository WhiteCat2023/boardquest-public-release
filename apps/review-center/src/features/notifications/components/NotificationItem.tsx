import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  UserCheck,
  Calendar,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NotificationItem, NotificationType } from "../types/types";
import {
  useMarkNotificationAsRead,
  useDeleteNotification,
} from "../api/useNotifications";

interface NotificationItemProps {
  notification: NotificationItem;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function formatTimeAgo(dateString: string): string {
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes === 1) return "about 1 minute ago";
    if (minutes < 60) return `about ${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "about 1 hour ago";
    if (hours < 24) return `about ${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "about 1 day ago";
    if (days < 30) return `about ${days} days ago`;
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "recently";
  }
}

export default function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const getIconAndStyle = (type: NotificationType) => {
    switch (type) {
      case "SUCCESS":
      case "QUESTION_APPROVED":
      case "SCORES_SAVED":
        return {
          icon: CheckCircle2,
          bgStyle:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          badgeLabel: "Success",
        };
      case "WARNING":
        return {
          icon: AlertTriangle,
          bgStyle:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          badgeLabel: "Warning",
        };
      case "ERROR":
        return {
          icon: AlertCircle,
          bgStyle: "bg-destructive/10 text-destructive border-destructive/20",
          badgeLabel: "Alert",
        };
      case "CANDIDATE":
      case "CANDIDATE_ENROLLED":
      case "BULK_ENROLLMENT":
      case "STUDENT_ASSIGNED":
        return {
          icon: UserCheck,
          bgStyle:
            "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          badgeLabel: "Candidate",
        };
      case "SCHEDULE":
      case "SCHEDULE_CREATED":
        return {
          icon: Calendar,
          bgStyle:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          badgeLabel: "Schedule",
        };
      case "ASSESSMENT":
        return {
          icon: CheckCircle2,
          bgStyle:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          badgeLabel: "Assessment",
        };
      case "SYSTEM":
      case "SYSTEM_UPDATE":
        return {
          icon: Sparkles,
          bgStyle:
            "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          badgeLabel: "System",
        };
      case "INFO":
      default:
        return {
          icon: Bell,
          bgStyle: "bg-primary/10 text-primary border-primary/20",
          badgeLabel: "Info",
        };
    }
  };

  const { icon: Icon, bgStyle, badgeLabel } = getIconAndStyle(
    notification.type,
  );

  const formattedTime = formatTimeAgo(notification.createdAt);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notification.id);
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative p-2.5 px-3.5 transition-all duration-150 flex items-start gap-3 cursor-pointer font-sans ${
        notification.isRead
          ? "bg-card hover:bg-accent/40 text-muted-foreground"
          : "bg-primary/5 hover:bg-primary/10 text-foreground font-medium"
      }`}
    >
      {/* Compact Type Icon Badge */}
      <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${bgStyle}`}>
        <Icon size={14} />
      </div>

      {/* Main Notification Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-xs font-bold ${
              notification.isRead ? "text-foreground/90" : "text-foreground"
            }`}
          >
            {notification.title}
          </span>

          <Badge
            variant="outline"
            className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0 rounded-md ${bgStyle}`}
          >
            {badgeLabel}
          </Badge>

          {!notification.isRead && (
            <span
              className="size-1.5 rounded-full bg-primary inline-block shrink-0 animate-pulse"
              title="Unread"
            />
          )}
        </div>

        <p className="text-[11.5px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
          {notification.message}
        </p>

        <div className="flex items-center gap-2.5 mt-1">
          <span className="text-[9.5px] font-mono text-muted-foreground/80">
            {formattedTime}
          </span>

          {notification.link && (
            <span className="text-[9.5px] font-bold text-primary flex items-center gap-0.5 group-hover:underline">
              View Details <ExternalLink size={9} />
            </span>
          )}
        </div>
      </div>

      {/* Compact Delete Button */}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={handleDelete}
        className="size-6 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2.5 top-2.5 cursor-pointer"
        title="Delete Notification"
      >
        <Trash2 size={12} />
      </Button>
    </div>
  );
}
