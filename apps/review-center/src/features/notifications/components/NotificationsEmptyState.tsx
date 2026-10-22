import { Inbox } from "lucide-react";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

interface NotificationsEmptyStateProps {
  title?: string;
  description?: string;
}

export function NotificationsEmptyState({
  title = "No Notifications Found",
  description = "There are no notification entries matching your current filters or search keywords.",
}: NotificationsEmptyStateProps) {
  return (
    <Empty className="py-12 px-4 font-sans border-0">
      <EmptyMedia
        variant="icon"
        className="size-12 rounded-2xl bg-muted/60 text-muted-foreground border border-border"
      >
        <Inbox size={22} />
      </EmptyMedia>
      <EmptyHeader className="gap-1">
        <EmptyTitle className="text-xs font-bold text-foreground">
          {title}
        </EmptyTitle>
        <EmptyDescription className="text-[11px] text-muted-foreground max-w-xs">
          {description}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export default NotificationsEmptyState;
