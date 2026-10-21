import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { showFeedback } from "@/components/modal";
import type { ReviewCenterRepresentative } from "../types/types";
import ReviewCenterEmptyState from "./ReviewCenterEmptyState";

interface ReviewCenterTableProps {
  items: ReviewCenterRepresentative[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onView: (item: ReviewCenterRepresentative) => void;
  onEdit: (item: ReviewCenterRepresentative) => void;
  onDelete?: (item: ReviewCenterRepresentative) => void;
  pagination?: React.ReactNode;
}

export default function ReviewCenterTable({
  items,
  isLoading,
  hasActiveFilters,
  onResetFilters,
  onView,
  onEdit,
  onDelete,
  pagination,
}: ReviewCenterTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getInitials = (name?: string) => {
    if (!name) return "RC";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleCopyEmail = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedId(email);
    showFeedback.success("Email copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recent";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  if (isLoading) {
    return (
      <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-2xs font-sans">
        <Table className="w-full text-left border-collapse">
          <TableHeader className="bg-muted/40 border-b border-border/80">
            <TableRow className="border-b border-border/80 hover:bg-transparent">
              <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Institution / Review Center
              </TableHead>
              <TableHead className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Representative
              </TableHead>
              <TableHead className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Contact
              </TableHead>
              <TableHead className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Location
              </TableHead>
              <TableHead className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Status & Registered
              </TableHead>
              <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {Array.from({ length: 6 }).map((_, idx) => (
              <TableRow key={idx} className="hover:bg-transparent">
                <TableCell className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8.5 rounded-lg bg-muted" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-36 bg-muted" />
                      <Skeleton className="h-2.5 w-20 bg-muted" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28 bg-muted" />
                    <Skeleton className="h-2.5 w-16 bg-muted" />
                  </div>
                </TableCell>
                <TableCell className="py-3 px-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-32 bg-muted" />
                    <Skeleton className="h-2.5 w-24 bg-muted" />
                  </div>
                </TableCell>
                <TableCell className="py-3 px-3">
                  <Skeleton className="h-3 w-24 bg-muted" />
                </TableCell>
                <TableCell className="py-3 px-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-16 rounded-full bg-muted" />
                    <Skeleton className="h-2.5 w-20 bg-muted" />
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Skeleton className="h-7 w-24 rounded-lg bg-muted" />
                    <Skeleton className="size-7 rounded-lg bg-muted" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <ReviewCenterEmptyState
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
      />
    );
  }

  return (
    <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-2xs font-sans">
      <div className="overflow-x-auto w-full">
        <Table className="w-full text-left border-collapse">
          <TableHeader className="bg-muted/40 border-b border-border/80">
            <TableRow className="border-b border-border/80 hover:bg-transparent">
              <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                Institution / Review Center
              </TableHead>
              <TableHead className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                Representative
              </TableHead>
              <TableHead className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                Contact Details
              </TableHead>
              <TableHead className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                Location
              </TableHead>
              <TableHead className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                Partnership
              </TableHead>
              <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right h-auto">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {items.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-muted/30 transition-colors group border-b border-border/60"
              >
                {/* Review Center / Institution */}
                <TableCell className="py-2.5 px-4">
                  <div
                    className="flex items-center gap-3 cursor-pointer group/center"
                    onClick={() => onView(item)}
                  >
                    <div className="size-8.5 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 group-hover/center:scale-105 transition-transform">
                      {getInitials(item.companyName)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className="text-xs font-bold text-foreground group-hover/center:text-primary transition-colors truncate max-w-[200px] md:max-w-[260px]"
                        title={item.companyName}
                      >
                        {item.companyName}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9.5px] font-mono font-medium text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border">
                          {item.employeeId || "RC-PARTNER"}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Representative */}
                <TableCell className="py-2.5 px-3">
                  <div className="flex flex-col min-w-0">
                    <span
                      className="text-xs font-semibold text-foreground truncate max-w-[170px]"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Representative
                    </span>
                  </div>
                </TableCell>

                {/* Contact Details */}
                <TableCell className="py-2.5 px-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Mail
                        size={11}
                        className="text-muted-foreground/70 shrink-0"
                      />
                      <span
                        className="text-[11px] font-medium text-foreground/90 truncate max-w-[150px]"
                        title={item.email}
                      >
                        {item.email}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyEmail(e, item.email)}
                        className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors cursor-pointer"
                        title="Copy Email"
                      >
                        {copiedId === item.email ? (
                          <Check size={11} className="text-emerald-500" />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    </div>
                    {item.phonenumber && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Phone
                          size={11}
                          className="text-muted-foreground/70 shrink-0"
                        />
                        <span>{item.phonenumber}</span>
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Location */}
                <TableCell className="py-2.5 px-3">
                  <div className="flex items-center gap-1 text-[11.5px] font-medium text-foreground/90">
                    <MapPin
                      size={11}
                      className="text-muted-foreground/70 shrink-0"
                    />
                    <span
                      className="truncate max-w-[140px]"
                      title={item.location || "Philippines"}
                    >
                      {item.location || "Philippines"}
                    </span>
                  </div>
                </TableCell>

                {/* Partnership Status & Date */}
                <TableCell className="py-2.5 px-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} className="text-emerald-500" />
                      Partner
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-normal">
                      <Calendar
                        size={10}
                        className="text-muted-foreground/70 shrink-0"
                      />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="py-2.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(item)}
                      className="h-7 text-[11px] font-semibold text-foreground bg-muted/40 hover:bg-accent border-border rounded-lg gap-1 px-2.5 cursor-pointer shadow-2xs"
                    >
                      <Eye size={12} className="text-muted-foreground" />
                      View Details
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      className="size-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                      title="Edit Details"
                    >
                      <Edit3 size={13} />
                    </Button>

                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item)}
                        className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                        title="Remove Partner"
                      >
                        <Trash2 size={13} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination}
    </div>
  );
}
