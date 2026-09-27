import React from "react";
import { Inbox } from "lucide-react";

interface NotificationsEmptyStateProps {
  title?: string;
  description?: string;
}

export function NotificationsEmptyState({
  title = "No Notifications Found",
  description = "There are no notification entries matching your current filters or search keywords.",
}: NotificationsEmptyStateProps) {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2">
      <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground border border-border">
        <Inbox size={26} />
      </div>
      <h3 className="text-xs font-bold text-foreground">{title}</h3>
      <p className="text-[11px] text-muted-foreground max-w-xs">
        {description}
      </p>
    </div>
  );
}

export default NotificationsEmptyState;
