import { Award, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameBadge } from "../../types/types";
import BadgeTableRow from "./BadgeTableRow";

interface BadgesTableProps {
  badges: GameBadge[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  imageErrorUrls: Record<string, boolean>;
  onImageError: (url?: string | null) => void;
  onResetFilters: () => void;
  onAddBadge: () => void;
  onEditBadge: (badge: GameBadge) => void;
  onDeleteBadge: (id: string) => void;
  onToggleActive: (id: string) => void;
  pagination?: React.ReactNode;
}

export default function BadgesTable({
  badges,
  isLoading,
  hasActiveFilters,
  imageErrorUrls,
  onImageError,
  onResetFilters,
  onAddBadge,
  onEditBadge,
  onDeleteBadge,
  onToggleActive,
  pagination,
}: BadgesTableProps) {
  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-2.5 px-4 font-extrabold">Badge & Artwork</th>
              <th className="py-2.5 px-3 font-extrabold">Tier</th>
              <th className="py-2.5 px-3 font-extrabold">Category</th>
              <th className="py-2.5 px-3 font-extrabold">XP Reward</th>
              <th className="py-2.5 px-3 font-extrabold">Unlock Rule</th>
              <th className="py-2.5 px-3 font-extrabold">Unlocked</th>
              <th className="py-2.5 px-3 font-extrabold">Status</th>
              <th className="py-2.5 px-4 font-extrabold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-muted shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 bg-muted rounded w-28" />
                        <div className="h-2.5 bg-muted rounded w-44" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 bg-muted rounded-full w-14" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-3.5 bg-muted rounded w-16" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-3.5 bg-muted rounded w-12" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-3.5 bg-muted rounded w-24" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-3.5 bg-muted rounded w-16" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 bg-muted rounded-full w-10" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="h-7 bg-muted rounded w-14 ml-auto" />
                  </td>
                </tr>
              ))
            ) : badges.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground border border-border flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      {hasActiveFilters
                        ? "No matching badges found"
                        : "No badges created yet"}
                    </h3>
                    <p className="text-xs text-muted-foreground text-center">
                      {hasActiveFilters
                        ? "Try clearing or modifying your search and filter criteria."
                        : "Create your first gamified achievement badge to award student progress."}
                    </p>
                    {hasActiveFilters ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onResetFilters}
                        className="mt-2 h-8 text-xs cursor-pointer"
                      >
                        Clear All Filters
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={onAddBadge}
                        className="mt-2 h-8 text-xs font-bold gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create First Badge
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              badges.map((badge) => (
                <BadgeTableRow
                  key={badge.id}
                  badge={badge}
                  imageError={Boolean(
                    (badge.spriteUrl || badge.imageUrl) &&
                      imageErrorUrls[badge.spriteUrl || badge.imageUrl || ""]
                  )}
                  onImageError={onImageError}
                  onEditBadge={onEditBadge}
                  onDeleteBadge={onDeleteBadge}
                  onToggleActive={onToggleActive}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination}
    </div>
  );
}
