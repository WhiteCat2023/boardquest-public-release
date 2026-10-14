import { useState, useMemo } from "react";
import { useEncodingTrackerOverview } from "../api/useEncodingTracker";
import { useSubjectNavCategories } from "../api/useSubjectNavCategories";
import {
  EncodingKPICards,
  EncodingTrackerFilters,
  FacultyEncodingTable,
  SetQuotaModal,
  NudgeTeacherModal,
} from "../components/tracker";
import { DataTablePagination } from "@/components/custom/pagination";
import { Button } from "@/components/ui/button";
import { RefreshCw, ClipboardCheck } from "lucide-react";
import type { FacultyTrackItem } from "../types/encodingTracker.types";

const ITEMS_PER_PAGE = 10;

export default function FacultyEncodingTracker() {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [quotaModalItem, setQuotaModalItem] = useState<FacultyTrackItem | null>(null);
  const [nudgeModalItem, setNudgeModalItem] = useState<FacultyTrackItem | null>(null);
  const [isBulkNudgeOpen, setIsBulkNudgeOpen] = useState(false);

  // Fetch tracker data
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
  } = useEncodingTrackerOverview({
    search,
    subjectId: selectedSubject,
    status: selectedStatus,
  });

  // Fetch subjects for dropdown
  const { categories } = useSubjectNavCategories();
  const subjectOptions = useMemo(() => {
    return categories.map((c: any) => ({
      id: c.id,
      name: c.name,
    }));
  }, [categories]);

  const kpis = data?.kpis;
  const items = data?.items || [];
  const schoolYear = data?.schoolYear || "S.Y. 2025-2026";

  const incompleteCount = useMemo(() => {
    if (!kpis) return 0;
    return kpis.notStartedCount + kpis.inProgressCount + kpis.overdueCount;
  }, [kpis]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedSubject !== "ALL" ||
    selectedStatus !== "ALL";

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleSubjectChange = (val: string) => {
    setSelectedSubject(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedSubject("ALL");
    setSelectedStatus("ALL");
    setCurrentPage(1);
  };

  // Pagination computations
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = useMemo(
    () => items.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [items, startIndex],
  );

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 w-full font-sans bg-background text-foreground">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Encoding Tracker
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monitor teacher question authoring quotas, submission rates, and
              deadlines across all subjects.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-9 text-xs gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <EncodingKPICards kpis={kpis} isLoading={isLoading} />

      {/* Filters Toolbar */}
      <EncodingTrackerFilters
        search={search}
        onSearchChange={handleSearchChange}
        selectedSubject={selectedSubject}
        onSubjectChange={handleSubjectChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        subjects={subjectOptions}
        onNudgeAllClick={() => setIsBulkNudgeOpen(true)}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        incompleteCount={incompleteCount}
      />

      {/* Faculty Encoding Roster Table */}
      <FacultyEncodingTable
        items={paginatedItems}
        isLoading={isLoading}
        onNudgeClick={(item) => setNudgeModalItem(item)}
        onSetQuotaClick={(item) => setQuotaModalItem(item)}
        pagination={
          !isLoading && totalItems > 0 && (
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={ITEMS_PER_PAGE}
              hasNextPage={currentPage < totalPages}
              hasPreviousPage={currentPage > 1}
              onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onPageSelect={(page) => setCurrentPage(page)}
              itemLabel="allocations"
              variant="table-footer"
            />
          )
        }
      />

      {/* Set Quota Modal */}
      <SetQuotaModal
        isOpen={Boolean(quotaModalItem)}
        onClose={() => setQuotaModalItem(null)}
        item={quotaModalItem}
      />

      {/* Single Nudge Modal */}
      <NudgeTeacherModal
        isOpen={Boolean(nudgeModalItem)}
        onClose={() => setNudgeModalItem(null)}
        item={nudgeModalItem}
        isBulk={false}
      />

      {/* Bulk Nudge Modal */}
      <NudgeTeacherModal
        isOpen={isBulkNudgeOpen}
        onClose={() => setIsBulkNudgeOpen(false)}
        item={null}
        isBulk={true}
        incompleteCount={incompleteCount}
        selectedSubject={selectedSubject}
        schoolYear={schoolYear}
      />
    </div>
  );
}
