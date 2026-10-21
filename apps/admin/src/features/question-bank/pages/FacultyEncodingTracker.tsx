import { useState, useMemo, useEffect } from "react";
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
import { StandardNavTabs, type NavTabItem } from "@/components/custom/tabs";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  ClipboardCheck,
  Users,
  AlertCircle,
  AlertTriangle,
  Clock,
  PencilLine,
  CheckCircle2,
} from "lucide-react";
import type {
  FacultyTrackItem,
  EncodingTrackerKPIs,
} from "../types/encodingTracker.types";

const ITEMS_PER_PAGE = 10;

export default function FacultyEncodingTracker() {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [quotaModalItem, setQuotaModalItem] = useState<FacultyTrackItem | null>(null);
  const [nudgeModalItem, setNudgeModalItem] = useState<FacultyTrackItem | null>(null);
  const [isBulkNudgeOpen, setIsBulkNudgeOpen] = useState(false);

  // Fetch tracker data
  const {
    data,
    isLoading,
    isRefetching,
    isPlaceholderData,
    refetch,
  } = useEncodingTrackerOverview({
    search,
    subjectId: selectedSubject,
    status: selectedStatus,
  });

  // Preserve stable KPIs so top stat cards and tab badges never flash into skeletons when navigating tabs
  const [stableKpis, setStableKpis] = useState<EncodingTrackerKPIs | undefined>(undefined);
  useEffect(() => {
    if (data?.kpis) {
      setStableKpis(data.kpis);
    }
  }, [data?.kpis]);

  const kpis = data?.kpis || stableKpis;
  const items = data?.items || [];
  const schoolYear = data?.schoolYear || "S.Y. 2025-2026";

  // Fetch subjects for dropdown
  const { categories } = useSubjectNavCategories();
  const subjectOptions = useMemo(() => {
    return categories.map((c: any) => ({
      id: c.id,
      name: c.name,
    }));
  }, [categories]);

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
    if (val === selectedStatus) return;
    setIsTabChanging(true);
    setSelectedStatus(val);
    setCurrentPage(1);
    setTimeout(() => {
      setIsTabChanging(false);
    }, 200);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedSubject("ALL");
    setSelectedStatus("ALL");
    setCurrentPage(1);
  };

  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Dedicated loading flags: top cards stay stable, ONLY table under tabs reloads
  const isInitialLoading = isLoading && !kpis;
  const isTableLoading = isInitialLoading || isPlaceholderData || isTabChanging;

  // Pagination computations
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, startIndex, pageSize],
  );

  // Status Navigation Tabs (standardized from Student View)
  const statusTabs: NavTabItem<string>[] = useMemo(
    () => [
      {
        id: "ALL",
        label: "All",
        icon: Users,
        badgeCount: kpis ? kpis.totalAssignments : undefined,
      },
      {
        id: "INCOMPLETE",
        label: "Incomplete Only",
        icon: AlertCircle,
        badgeCount: kpis ? incompleteCount : undefined,
      },
      {
        id: "OVERDUE",
        label: "Overdue",
        icon: AlertTriangle,
        badgeCount: kpis ? kpis.overdueCount : undefined,
      },
      {
        id: "NOT_STARTED",
        label: "Not Started",
        icon: Clock,
        badgeCount: kpis ? kpis.notStartedCount : undefined,
      },
      {
        id: "IN_PROGRESS",
        label: "In Progress",
        icon: PencilLine,
        badgeCount: kpis ? kpis.inProgressCount : undefined,
      },
      {
        id: "COMPLETED",
        label: "Completed",
        icon: CheckCircle2,
        badgeCount: kpis ? kpis.completedCount : undefined,
      },
    ],
    [kpis, incompleteCount],
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
            disabled={isInitialLoading || isRefetching}
            className="h-9 text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards: Only reload/skeleton on initial page load, NEVER when navigating tabs */}
      <EncodingKPICards kpis={kpis} isLoading={isInitialLoading} />

      {/* Standardized Navigation Tabs (matching Student View) */}
      <StandardNavTabs
        tabs={statusTabs}
        activeTab={selectedStatus}
        onTabChange={handleStatusChange}
        showScrollButtons="auto"
        rightContent={
          <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            <span className="hidden md:inline">
              Allocations: <span className="text-foreground font-bold">{kpis?.totalAssignments ?? totalItems}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-muted text-[11px] font-bold text-foreground border border-border">
              {schoolYear}
            </span>
          </div>
        }
      />

      {/* Filters Toolbar */}
      <EncodingTrackerFilters
        search={search}
        onSearchChange={handleSearchChange}
        selectedSubject={selectedSubject}
        onSubjectChange={handleSubjectChange}
        subjects={subjectOptions}
        onNudgeAllClick={() => setIsBulkNudgeOpen(true)}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        incompleteCount={incompleteCount}
      />

      {/* Faculty Encoding Roster Table: ONLY this table reloads when navigating tabs */}
      <FacultyEncodingTable
        items={paginatedItems}
        isLoading={isTableLoading}
        onNudgeClick={(item) => setNudgeModalItem(item)}
        onSetQuotaClick={(item) => setQuotaModalItem(item)}
        pagination={
          !isTableLoading && totalItems > 0 && (
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              pageSizeOptions={[10, 20, 30, 50]}
              onPageSizeChange={handlePageSizeChange}
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
