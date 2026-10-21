import { Crown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RankTier } from "../../types/types";
import RankTableRow from "./RankTableRow";
import { ColumnHeaderFilter } from "@/components/custom/table";

interface RanksTableProps {
  ranks: RankTier[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  selectedStatus?: string;
  onStatusChange?: (val: string) => void;
  onResetFilters: () => void;
  onAddRank: () => void;
  onEditRank: (rank: RankTier) => void;
  onDeleteRank: (rank: RankTier) => void;
  onToggleRankActive: (id: string) => void;
  onInspectStudents: (rank: RankTier) => void;
  pagination?: React.ReactNode;
}

export default function RanksTable({
  ranks,
  isLoading,
  hasActiveFilters,
  selectedStatus = "ALL",
  onStatusChange,
  onResetFilters,
  onAddRank,
  onEditRank,
  onDeleteRank,
  onToggleRankActive,
  onInspectStudents,
  pagination,
}: RanksTableProps) {
  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-2.5 px-4 font-extrabold">Rank Tier & Artwork</th>
              <th className="py-2.5 px-3 font-extrabold">Level Bracket</th>
              <th className="py-2.5 px-3 font-extrabold">Min Required XP</th>
              <th className="py-2.5 px-3 font-extrabold">Perks & Perks</th>
              <th className="py-2.5 px-3 font-extrabold">Enrolled Students</th>
              <th className="py-2.5 px-3 font-extrabold">
                {onStatusChange ? (
                  <ColumnHeaderFilter
                    title="Status"
                    selectedValue={selectedStatus}
                    onSelect={onStatusChange}
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Disabled", value: "inactive" },
                    ]}
                  />
                ) : (
                  "Status"
                )}
              </th>
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
                    <div className="h-4 bg-muted rounded-full w-20" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-3.5 bg-muted rounded w-16" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-3.5 bg-muted rounded w-28" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-6 bg-muted rounded-lg w-24" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 bg-muted rounded-full w-10" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="h-7 bg-muted rounded w-14 ml-auto" />
                  </td>
                </tr>
              ))
            ) : ranks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground border border-border flex items-center justify-center">
                      <Crown className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      {hasActiveFilters
                        ? "No matching rank tiers found"
                        : "No rank tiers created yet"}
                    </h3>
                    <p className="text-xs text-muted-foreground text-center">
                      {hasActiveFilters
                        ? "Try clearing or modifying your search and filter criteria."
                        : "Configure your first Aspirant rank tier to establish player progression."}
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
                        onClick={onAddRank}
                        className="mt-2 h-8 text-xs font-bold gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create First Rank Tier
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              ranks.map((rank) => (
                <RankTableRow
                  key={rank.id}
                  rank={rank}
                  onEditRank={onEditRank}
                  onDeleteRank={onDeleteRank}
                  onToggleRankActive={onToggleRankActive}
                  onInspectStudents={onInspectStudents}
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
