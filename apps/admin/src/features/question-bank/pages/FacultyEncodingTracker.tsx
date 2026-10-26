import { useState, useMemo, useEffect } from "react";
import { useEncodingTrackerOverview } from "../api/useEncodingTracker";
import { useSubjectNavCategories } from "../api/useSubjectNavCategories";
import {
  EncodingKPICards,
  EncodingTrackerFilters,
  SubjectEncodingTable,
  NudgeTeacherModal,
  SetSubjectQuotaModal,
  NudgeSubjectModal,
} from "../components/tracker";
import { DataTablePagination } from "@/components/custom/pagination";
import { StandardNavTabs, type NavTabItem } from "@/components/custom/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  SubjectTrackItem,
  EncodingTrackerKPIs,
} from "../types/encodingTracker.types";

const ITEMS_PER_PAGE = 10;

export default function FacultyEncodingTracker() {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [subjectQuotaModalItem, setSubjectQuotaModalItem] =
    useState<SubjectTrackItem | null>(null);
  const [subjectNudgeModalItem, setSubjectNudgeModalItem] =
    useState<SubjectTrackItem | null>(null);
  const [isBulkNudgeOpen, setIsBulkNudgeOpen] = useState(false);

  // Fetch tracker data
  const { data, isLoading, isRefetching, isPlaceholderData, refetch } =
    useEncodingTrackerOverview({
      search,
      subjectId: selectedSubject,
      status: selectedStatus,
    });

  // Preserve stable KPIs so top stat cards and tab badges never flash into skeletons when navigating tabs
  const [stableKpis, setStableKpis] = useState<EncodingTrackerKPIs | undefined>(
    undefined,
  );
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

  // Subject aggregation computations
  const subjectAggregatedItems = useMemo<SubjectTrackItem[]>(() => {
    const map = new Map<string, SubjectTrackItem>();

    for (const item of items) {
      // Strictly track faculty teachers (exclude external accounts like Review Center and admin staff)
      if (
        item.teacher?.role &&
        String(item.teacher.role).toUpperCase() !== "TEACHER"
      ) {
        continue;
      }
      const subId = item.subject.id;
      let existing = map.get(subId);
      if (!existing) {
        existing = {
          id: subId,
          subject: item.subject,
          assignedTeachers: [],
          teacherCount: 0,
          targetCount: 0,
          encodedCount: 0,
          remainingCount: 0,
          progressPercentage: 0,
          breakdown: {
            approved: 0,
            pendingReview: 0,
            pendingRevision: 0,
          },
          status: "NOT_STARTED",
          earliestDeadline: null,
          hasOverdueTeacher: false,
          schoolYear: item.schoolYear,
        };
        map.set(subId, existing);
      }

      existing.assignedTeachers.push(item);
      existing.targetCount += item.targetCount;
      existing.encodedCount += item.encodedCount;
      existing.breakdown.approved += item.breakdown.approved;
      existing.breakdown.pendingReview += item.breakdown.pendingReview;
      existing.breakdown.pendingRevision += item.breakdown.pendingRevision;

      if (item.isPastDeadline || item.status === "OVERDUE") {
        existing.hasOverdueTeacher = true;
      }

      if (item.deadline) {
        if (!existing.earliestDeadline) {
          existing.earliestDeadline = item.deadline;
        } else if (
          new Date(item.deadline) < new Date(existing.earliestDeadline)
        ) {
          existing.earliestDeadline = item.deadline;
        }
      }
    }

    // Include any subjects in categories that don't have active assignments if matching filter
    for (const cat of categories) {
      if (!map.has(cat.id)) {
        if (selectedSubject !== "ALL" && selectedSubject !== cat.id) continue;
        if (
          search.trim() &&
          !cat.name.toLowerCase().includes(search.trim().toLowerCase())
        )
          continue;

        map.set(cat.id, {
          id: cat.id,
          subject: { id: cat.id, name: cat.name, icon: cat.icon },
          assignedTeachers: [],
          teacherCount: 0,
          targetCount: 0,
          encodedCount: 0,
          remainingCount: 0,
          progressPercentage: 0,
          breakdown: { approved: 0, pendingReview: 0, pendingRevision: 0 },
          status: "NOT_STARTED",
          earliestDeadline: null,
          hasOverdueTeacher: false,
          schoolYear,
        });
      }
    }

    const result: SubjectTrackItem[] = [];
    for (const sub of map.values()) {
      sub.teacherCount = sub.assignedTeachers.length;
      sub.remainingCount = Math.max(0, sub.targetCount - sub.encodedCount);
      sub.progressPercentage = Math.min(
        100,
        Math.round((sub.encodedCount / Math.max(1, sub.targetCount)) * 100),
      );

      if (sub.encodedCount >= sub.targetCount && sub.targetCount > 0) {
        sub.status = "COMPLETED";
      } else if (sub.hasOverdueTeacher) {
        sub.status = "OVERDUE";
      } else if (sub.encodedCount === 0) {
        sub.status = "NOT_STARTED";
      } else {
        sub.status = "IN_PROGRESS";
      }

      result.push(sub);
    }

    const sortPriority: Record<string, number> = {
      OVERDUE: 1,
      NOT_STARTED: 2,
      IN_PROGRESS: 3,
      COMPLETED: 4,
    };
    result.sort((a, b) => {
      const pDiff =
        (sortPriority[a.status] || 5) - (sortPriority[b.status] || 5);
      if (pDiff !== 0) return pDiff;
      return a.subject.name.localeCompare(b.subject.name);
    });

    return result;
  }, [items, categories, selectedSubject, search, schoolYear]);

  // Filter subjects based on selectedStatus
  const filteredSubjectItems = useMemo(() => {
    if (selectedStatus === "ALL") return subjectAggregatedItems;
    if (selectedStatus === "INCOMPLETE") {
      return subjectAggregatedItems.filter(
        (s) =>
          s.status === "NOT_STARTED" ||
          s.status === "IN_PROGRESS" ||
          s.status === "OVERDUE",
      );
    }
    return subjectAggregatedItems.filter((s) => s.status === selectedStatus);
  }, [subjectAggregatedItems, selectedStatus]);

  // Subject pagination
  const totalSubjectItems = filteredSubjectItems.length;
  const totalSubjectPages = Math.max(
    1,
    Math.ceil(totalSubjectItems / pageSize),
  );
  const startSubjectIndex = (currentPage - 1) * pageSize;
  const paginatedSubjectItems = useMemo(
    () =>
      filteredSubjectItems.slice(
        startSubjectIndex,
        startSubjectIndex + pageSize,
      ),
    [filteredSubjectItems, startSubjectIndex, pageSize],
  );

  // Subject status counts for status tab badges
  const subjectStatusCounts = useMemo(() => {
    let overdue = 0;
    let notStarted = 0;
    let inProgress = 0;
    let completed = 0;
    for (const s of subjectAggregatedItems) {
      if (s.status === "OVERDUE") overdue++;
      else if (s.status === "NOT_STARTED") notStarted++;
      else if (s.status === "IN_PROGRESS") inProgress++;
      else if (s.status === "COMPLETED") completed++;
    }
    return {
      total: subjectAggregatedItems.length,
      incomplete: overdue + notStarted + inProgress,
      overdue,
      notStarted,
      inProgress,
      completed,
    };
  }, [subjectAggregatedItems]);

  // Status Navigation Tabs (badge counts for subject health statuses)
  const statusTabs: NavTabItem<string>[] = useMemo(
    () => [
      {
        id: "ALL",
        label: "All",
        icon: Users,
        badgeCount: subjectStatusCounts.total,
      },
      {
        id: "INCOMPLETE",
        label: "Incomplete Only",
        icon: AlertCircle,
        badgeCount: subjectStatusCounts.incomplete,
      },
      {
        id: "OVERDUE",
        label: "Overdue",
        icon: AlertTriangle,
        badgeCount: subjectStatusCounts.overdue,
      },
      {
        id: "NOT_STARTED",
        label: "Not Started",
        icon: Clock,
        badgeCount: subjectStatusCounts.notStarted,
      },
      {
        id: "IN_PROGRESS",
        label: "In Progress",
        icon: PencilLine,
        badgeCount: subjectStatusCounts.inProgress,
      },
      {
        id: "COMPLETED",
        label: "Completed",
        icon: CheckCircle2,
        badgeCount: subjectStatusCounts.completed,
      },
    ],
    [subjectStatusCounts],
  );

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 w-full font-sans bg-background text-foreground">

      {/* KPI Cards: Only reload/skeleton on initial page load, NEVER when navigating tabs */}
      <EncodingKPICards kpis={kpis} isLoading={isInitialLoading} />

      {/* Standardized Navigation Tabs (matching Student View) */}
      <StandardNavTabs
        tabs={statusTabs}
        activeTab={selectedStatus}
        onTabChange={handleStatusChange}
        showScrollButtons="auto"
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

      {/* Aggregated Subject Health Table */}
      <SubjectEncodingTable
        items={paginatedSubjectItems}
        isLoading={isTableLoading}
        selectedSubject={selectedSubject}
        onSubjectChange={handleSubjectChange}
        subjects={subjectOptions}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        onSetSubjectQuotaClick={(item) => setSubjectQuotaModalItem(item)}
        onNudgeSubjectClick={(item) => setSubjectNudgeModalItem(item)}
        pagination={
          !isTableLoading &&
          totalSubjectItems > 0 && (
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalSubjectPages}
              totalItems={totalSubjectItems}
              pageSize={pageSize}
              pageSizeOptions={[6, 12, 24, 48]}
              onPageSizeChange={handlePageSizeChange}
              hasNextPage={currentPage < totalSubjectPages}
              hasPreviousPage={currentPage > 1}
              onNext={() =>
                setCurrentPage((p) => Math.min(totalSubjectPages, p + 1))
              }
              onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onPageSelect={(page) => setCurrentPage(page)}
              itemLabel="subjects"
              variant="table-footer"
            />
          )
        }
      />

      {/* Set Subject Quota Modal (with handler division) */}
      <SetSubjectQuotaModal
        isOpen={Boolean(subjectQuotaModalItem)}
        onClose={() => setSubjectQuotaModalItem(null)}
        subject={subjectQuotaModalItem}
      />

      {/* Subject Nudge Modal */}
      <NudgeSubjectModal
        isOpen={Boolean(subjectNudgeModalItem)}
        onClose={() => setSubjectNudgeModalItem(null)}
        subject={subjectNudgeModalItem}
        schoolYear={schoolYear}
      />

      {/* Global Bulk Nudge Modal */}
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
