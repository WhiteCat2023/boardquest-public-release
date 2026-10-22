import { useState } from "react";
import {
  Search,
  RotateCcw,
  X,
  GraduationCap,
  UserCheck,
  Users,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { showFeedback } from "@/components/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStudents } from "@/features/students";
import useRoleFlags from "@/hooks/useRoleFlags";
import StudentHeader from "../components/StudentHeader";
import StudentTable from "../components/StudentTable";
import GuidanceAssignmentsDesk from "../components/GuidanceAssignmentsDesk";
import AssignGuidanceModal from "../components/AssignGuidanceModal";
import EmailStudentModal from "../components/EmailStudentModal";
import { DataTablePagination } from "@/components/custom/pagination";
import { StandardNavTabs } from "@/components/custom/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 25;

export default function StudentManagement() {
  const { isTeacher, isAdminOrSuperAdmin, isTeamLead, currentUser } = useRoleFlags();
  const canAssignGuidance = isAdminOrSuperAdmin || isTeamLead;

  type StudentTab =
    | "ALL"
    | "MY_ADVISEES"
    | "FAILING"
    | "BEHIND"
    | "DORMANT"
    | "GUIDANCE";

  const [activeTab, setActiveTab] = useState<StudentTab>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaceStatus, setSelectedPaceStatus] = useState<string>("ALL");
  const [selectedEngagement, setSelectedEngagement] = useState<string>("ALL");
  const [selectedAcademicStanding, setSelectedAcademicStanding] = useState<string>("ALL");
  const [filterMyAdviseesOnly, setFilterMyAdviseesOnly] = useState<boolean>(false);
  const [selectedStudentForGuidance, setSelectedStudentForGuidance] =
    useState<any>(null);
  const [selectedStudentsForGuidance, setSelectedStudentsForGuidance] =
    useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [emailTargetStudent, setEmailTargetStudent] = useState<any>(null);

  // Pagination State (offset-based, mirrors FacultyManagement cursor-stack pattern)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const skip = (currentPage - 1) * pageSize;

  const { data, isLoading } = useStudents({
    search: searchTerm,
    paceStatus: selectedPaceStatus,
    engagement: selectedEngagement,
    academicStanding: selectedAcademicStanding,
    advisorId: filterMyAdviseesOnly && currentUser?.id ? currentUser.id : undefined,
    skip,
    take: pageSize,
  });

  const studentsList = data?.students || [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasNextPage = currentPage < totalPages;

  const resetPagination = () => {
    setCurrentPage(1);
    setSelectedStudentIds([]);
  };

  const handleNext = () => {
    if (hasNextPage) setCurrentPage((p) => p + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handlePageSelect = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const isStudentAssignable = (s: any) => {
    const active =
      s.activeGuidance ||
      (s.guidanceAssignments || []).find(
        (g: any) =>
          String(g.status).toUpperCase() === "PENDING" ||
          String(g.status).toUpperCase() === "IN_PROGRESS",
      );
    return !active;
  };

  const assignableStudents = studentsList.filter(isStudentAssignable);

  const isAllSelected =
    assignableStudents.length > 0 &&
    assignableStudents.every((s) => selectedStudentIds.includes(s.id));

  const handleToggleSelect = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const pageIds = assignableStudents.map((s) => s.id);
      setSelectedStudentIds((prev) =>
        prev.filter((id) => !pageIds.includes(id))
      );
    } else {
      const pageIds = assignableStudents.map((s) => s.id);
      setSelectedStudentIds((prev) =>
        Array.from(new Set([...prev, ...pageIds]))
      );
    }
  };

  const handleOpenBulkAssignGuidance = () => {
    const targets = assignableStudents.filter((s) =>
      selectedStudentIds.includes(s.id)
    );
    if (targets.length === 0) {
      showFeedback.error("Please select at least one student to assign guidance.");
      return;
    }
    setSelectedStudentsForGuidance(targets);
    setSelectedStudentForGuidance(null);
    setIsGuidanceModalOpen(true);
  };

  const handleOpenAssignGuidance = (student: any) => {
    setSelectedStudentForGuidance(student);
    setSelectedStudentsForGuidance([]);
    setIsGuidanceModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedPaceStatus("ALL");
    setSelectedEngagement("ALL");
    setSelectedAcademicStanding("ALL");
    setFilterMyAdviseesOnly(false);
    setSelectedStudentIds([]);
    setActiveTab("ALL");
    resetPagination();
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedPaceStatus !== "ALL" ||
    selectedEngagement !== "ALL" ||
    selectedAcademicStanding !== "ALL" ||
    filterMyAdviseesOnly;

  const handleTabChange = (tabId: string) => {
    const tab = tabId as StudentTab;
    setActiveTab(tab);
    if (tab === "GUIDANCE") {
      return;
    }
    if (tab === "ALL") {
      setSelectedAcademicStanding("ALL");
      setSelectedPaceStatus("ALL");
      setSelectedEngagement("ALL");
      setFilterMyAdviseesOnly(false);
    } else if (tab === "MY_ADVISEES") {
      setSelectedAcademicStanding("ALL");
      setSelectedPaceStatus("ALL");
      setSelectedEngagement("ALL");
      setFilterMyAdviseesOnly(true);
    } else if (tab === "FAILING") {
      setSelectedAcademicStanding("FAILING");
      setSelectedPaceStatus("ALL");
      setSelectedEngagement("ALL");
      setFilterMyAdviseesOnly(false);
    } else if (tab === "BEHIND") {
      setSelectedPaceStatus("BEHIND");
      setSelectedAcademicStanding("ALL");
      setSelectedEngagement("ALL");
      setFilterMyAdviseesOnly(false);
    } else if (tab === "DORMANT") {
      setSelectedEngagement("DORMANT");
      setSelectedAcademicStanding("ALL");
      setSelectedPaceStatus("ALL");
      setFilterMyAdviseesOnly(false);
    }
    resetPagination();
  };

  const activeTabId: string =
    activeTab === "GUIDANCE"
      ? "GUIDANCE"
      : filterMyAdviseesOnly
        ? "MY_ADVISEES"
        : selectedAcademicStanding === "FAILING" &&
            selectedPaceStatus === "ALL" &&
            selectedEngagement === "ALL"
          ? "FAILING"
          : selectedPaceStatus === "BEHIND" &&
              selectedAcademicStanding === "ALL" &&
              selectedEngagement === "ALL"
            ? "BEHIND"
            : selectedEngagement === "DORMANT" &&
                selectedAcademicStanding === "ALL" &&
                selectedPaceStatus === "ALL"
              ? "DORMANT"
              : selectedAcademicStanding === "ALL" &&
                  selectedPaceStatus === "ALL" &&
                  selectedEngagement === "ALL" &&
                  !filterMyAdviseesOnly
                ? "ALL"
                : activeTab;

  return (
    <div className="flex flex-col gap-3.5 p-4 md:p-6 pb-20 w-full font-sans bg-background text-foreground">
      {/* 1. Header Bar */}
      <StudentHeader
        canAddStudent={true}
        title={
          filterMyAdviseesOnly
            ? "My Advisees"
            : "Student Directory & Advising"
        }
        description={
          filterMyAdviseesOnly
            ? "View and monitor the students assigned to you for academic guidance and mentoring."
            : isTeacher
            ? "View and monitor all enrolled students, academic standing, and game progress."
            : "Manage enrolled students, academic standing, and guidance advising."
        }
        currentStanding={selectedAcademicStanding}
        currentPace={selectedPaceStatus}
        currentEngagement={selectedEngagement}
      />

      {/* 2. Unified Primary Navigation Tabs */}
      <StandardNavTabs
        tabs={[
          {
            id: "ALL",
            label: "All Students",
            icon: GraduationCap,
            badgeCount: activeTabId === "ALL" ? total : undefined,
          },
          ...(isTeacher
            ? [
                {
                  id: "MY_ADVISEES",
                  label: "My Advisees",
                  icon: Users,
                  tone: "primary" as const,
                  badgeCount: activeTabId === "MY_ADVISEES" ? total : undefined,
                },
              ]
            : []),
          {
            id: "FAILING",
            label: "At-Risk & Failing",
            icon: AlertTriangle,
            tone: "danger" as const,
            badgeCount: activeTabId === "FAILING" ? total : undefined,
          },
          {
            id: "BEHIND",
            label: "Behind Schedule",
            icon: Clock,
            tone: "warning" as const,
            badgeCount: activeTabId === "BEHIND" ? total : undefined,
          },
          {
            id: "DORMANT",
            label: "Dormant",
            tone: "neutral" as const,
            badgeCount: activeTabId === "DORMANT" ? total : undefined,
          },
          {
            id: "GUIDANCE",
            label: "Academic Guidance Desk",
            icon: UserCheck,
            tone: "primary" as const,
          },
        ]}
        activeTab={activeTabId}
        onTabChange={handleTabChange}
        rightContent={
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>{activeTabId === "ALL" ? "Total Registered:" : "Students Found:"}</span>
            {isLoading ? (
              <Skeleton className="h-4 w-6 rounded inline-block" />
            ) : (
              <span className="text-foreground font-bold">{total}</span>
            )}
          </div>
        }
      />

      {activeTabId !== "GUIDANCE" ? (
        <>

          {/* Search & Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card border border-border/80 p-2.5 px-3 rounded-2xl shadow-2xs w-full">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
              <Input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  resetPagination();
                }}
                className="pl-9 pr-8 h-9 bg-muted/30 border border-border/80 rounded-xl text-xs text-foreground focus:ring-1 focus:ring-ring/20 focus:border-primary placeholder:text-muted-foreground w-full"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    resetPagination();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl gap-1 cursor-pointer px-2.5 shrink-0"
              >
                <RotateCcw size={12} />
                Reset Filters
              </Button>
            )}
          </div>

          {/* Bulk Selection Action Bar */}
          {canAssignGuidance && selectedStudentIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-primary/10 border border-primary/25 p-2.5 px-4 rounded-2xl shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-primary">
                  {selectedStudentIds.length} student{selectedStudentIds.length > 1 ? "s" : ""} selected
                </span>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds([])}
                  className="text-muted-foreground hover:text-foreground text-xs underline cursor-pointer"
                >
                  Clear selection
                </button>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleOpenBulkAssignGuidance}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3.5 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck size={14} />
                <span>Bulk Assign Guidance ({selectedStudentIds.length})</span>
              </Button>
            </div>
          )}

          {/* 4. Student Directory Table with Integrated Footer */}
          <StudentTable
            students={studentsList}
            isLoading={isLoading}
            onAssignGuidance={handleOpenAssignGuidance}
            onReachOut={(student) => setEmailTargetStudent(student)}
            selectedIds={selectedStudentIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            isAllSelected={isAllSelected}
            canSelect={canAssignGuidance}
            selectedAcademicStanding={selectedAcademicStanding}
            onAcademicStandingChange={(v) => {
              setSelectedAcademicStanding(v);
              resetPagination();
            }}
            selectedPaceStatus={selectedPaceStatus}
            onPaceStatusChange={(v) => {
              setSelectedPaceStatus(v);
              resetPagination();
            }}
            selectedEngagement={selectedEngagement}
            onEngagementChange={(v) => {
              setSelectedEngagement(v);
              resetPagination();
            }}
            emptyTitle={
              filterMyAdviseesOnly
                ? "No Assigned Advisees"
                : "No Enrolled Students Registered"
            }
            emptyDescription={
              filterMyAdviseesOnly
                ? "You currently do not have any students assigned to you for academic guidance."
                : "No students match the selected filter criteria."
            }
            pagination={
              isLoading ? (
                <div className="border-t border-border/60 p-2.5 px-4 bg-muted/20 flex items-center justify-between">
                  <Skeleton className="h-4 w-32 rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-20 rounded-lg" />
                    <Skeleton className="size-7 rounded-lg" />
                    <Skeleton className="size-7 rounded-lg" />
                  </div>
                </div>
              ) : (
                total > 0 && (
                  <DataTablePagination
                    currentPage={currentPage}
                    hasNextPage={hasNextPage}
                    hasPreviousPage={currentPage > 1}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onPageSelect={handlePageSelect}
                    totalPages={totalPages}
                    totalItems={total}
                    pageSize={pageSize}
                    pageSizeOptions={[10, 20, 30, 50]}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setCurrentPage(1);
                    }}
                    itemLabel="students"
                    variant="table-footer"
                  />
                )
              )
            }
          />
        </>
      ) : (
        <GuidanceAssignmentsDesk />
      )}

      {(selectedStudentForGuidance || selectedStudentsForGuidance.length > 0) && (
        <AssignGuidanceModal
          isOpen={isGuidanceModalOpen}
          onClose={() => {
            setIsGuidanceModalOpen(false);
            setSelectedStudentForGuidance(null);
            setSelectedStudentsForGuidance([]);
          }}
          onSuccess={() => {
            setSelectedStudentIds([]);
          }}
          student={selectedStudentForGuidance}
          students={selectedStudentsForGuidance}
        />
      )}

      {emailTargetStudent && (
        <EmailStudentModal
          isOpen={!!emailTargetStudent}
          onClose={() => setEmailTargetStudent(null)}
          student={emailTargetStudent}
          defaultSubjectCategory={emailTargetStudent.failingSubjects?.[0]}
        />
      )}
    </div>
  );
}
