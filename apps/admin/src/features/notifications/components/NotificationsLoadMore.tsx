import React from "react";
import { ChevronDown, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationsLoadMoreProps {
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  hasNotifications: boolean;
  onFetchNextPage: () => void;
}

export function NotificationsLoadMore({
  hasNextPage,
  isFetchingNextPage,
  hasNotifications,
  onFetchNextPage,
}: NotificationsLoadMoreProps) {
  if (hasNextPage) {
    return (
      <div className="p-3.5 flex justify-center items-center bg-muted/10 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isFetchingNextPage}
          onClick={onFetchNextPage}
          className="h-8.5 px-5 rounded-xl border-border bg-card hover:bg-accent text-foreground text-xs font-semibold shadow-2xs gap-2 transition-all cursor-pointer"
        >
          {isFetchingNextPage ? (
            <>
              <Loader2 size={14} className="animate-spin text-primary" />
              <span>Loading more notifications...</span>
            </>
          ) : (
            <>
              <ChevronDown size={14} className="text-muted-foreground" />
              <span>View More Notifications</span>
            </>
          )}
        </Button>
      </div>
    );
  }

  if (hasNotifications) {
    return (
      <div className="py-3 px-4 text-center border-t border-border/60 bg-muted/5">
        <p className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1.5">
          <CheckCircle2 size={12} className="text-emerald-500/80" />
          <span>You're all caught up. No more notifications to load.</span>
        </p>
      </div>
    );
  }

  return null;
}

export default NotificationsLoadMore;
