import React from "react";
import { Users, Search, UserCheck, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { PendingReviewAuthor } from "../../api/useQuestionBank";

interface AuthorsSidebarProps {
  authors: PendingReviewAuthor[];
  isLoading: boolean;
  selectedAuthorId: string;
  onSelectAuthor: (authorId: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function AuthorsSidebar({
  authors,
  isLoading,
  selectedAuthorId,
  onSelectAuthor,
  search,
  onSearchChange,
}: AuthorsSidebarProps) {
  return (
    <aside className="w-full lg:w-64 xl:w-72 2xl:w-76 shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-card/60 backdrop-blur-md flex flex-col max-h-[30vh] lg:max-h-none h-auto lg:h-full">
      {/* Sidebar Header */}
      <div className="p-3.5 px-4 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Users size={15} />
            </div>
            <span className="text-xs font-bold text-foreground tracking-tight">
              Submitting Users
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-mono font-bold bg-muted text-muted-foreground border-border px-1.5 py-0"
          >
            {authors.length}
          </Badge>
        </div>

        {/* Search Authors Input */}
        <div className="relative mt-2.5">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3" />
          <Input
            type="text"
            placeholder="Filter by name, dept..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-2.5 h-7 text-[11px] bg-muted/40 border border-border rounded-lg focus:ring-1 focus:ring-ring/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Authors List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {isLoading ? (
          <div className="space-y-2 p-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-14 w-full rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : authors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-2">
              <UserCheck size={20} />
            </div>
            <p className="text-xs font-bold text-foreground">
              All Submissions Cleared
            </p>
            <p className="text-[10.5px] text-muted-foreground mt-0.5 max-w-[180px]">
              No faculty members have questions awaiting review.
            </p>
          </div>
        ) : (
          authors.map((author) => {
            const isSelected = author.id === selectedAuthorId;
            const initials = author.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            return (
              <button
                key={author.id}
                onClick={() => onSelectAuthor(author.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between group border ${
                  isSelected
                    ? "bg-primary/10 border-primary/30 shadow-2xs"
                    : "bg-card/70 hover:bg-accent/60 border-border/70 hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 border border-border shrink-0">
                    <AvatarFallback
                      className={`text-[11px] font-bold ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary transition-colors"
                      }`}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 leading-tight">
                    <span
                      className={`text-xs font-bold block truncate ${
                        isSelected
                          ? "text-primary font-extrabold"
                          : "text-foreground"
                      }`}
                    >
                      {author.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate mt-0.5">
                      {author.email}
                    </span>
                    {author.latestSubmissionAt && (
                      <span className="text-[9px] text-muted-foreground/80 flex items-center gap-1 mt-0.5 font-mono">
                        <Clock size={9} />
                        {new Date(
                          author.latestSubmissionAt,
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                        ,{" "}
                        {new Date(
                          author.latestSubmissionAt,
                        ).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 shadow-2xs ${
                    isSelected
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  }`}
                >
                  {author.pendingCount}
                </Badge>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

export default AuthorsSidebar;
