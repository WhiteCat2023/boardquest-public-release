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
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudents } from "@/features/students";
import useRoleFlags from "@/hooks/useRoleFlags";
import StudentHeader from "../components/StudentHeader";
import StudentTable from "../components/StudentTable";
import GuidanceAssignmentsDesk from "../components/GuidanceAssignmentsDesk";
import AssignGuidanceModal from "../components/AssignGuidanceModal";
import EmailStudentModal from "../components/EmailStudentModal";
import { DataTablePagination } from "@/components/custom/pagination";

const ITEMS_PER_PAGE = 25;

export default function StudentManagement() {
  const { isTeacher, isAdminOrSuperAdmin, isTeamLead, currentUser } = useRoleFlags();
  const canAssignGuidance = isAdminOrSuperAdmin || isTeamLead;

  const [activeTab, setActiveTab] = useState<"DIRECTORY" | "GUIDANCE">(
    "DIRECTORY",
  );
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
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const { data, isLoading } = useStudents({
    search: searchTerm,
    paceStatus: selectedPaceStatus,
    engagement: selectedEngagement,
    academicStanding: selectedAcademicStanding,
    advisorId: filterMyAdviseesOnly && currentUser?.id ? currentUser.id : undefined,
    skip,
    take: ITEMS_PER_PAGE,
  });

  const studentsList = data?.students || [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
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
      toast.error("Please select at least one student to assign guidance.");
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
    resetPagination();
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedPaceStatus !== "ALL" ||
    selectedEngagement !== "ALL" ||
    selectedAcademicStanding !== "ALL" ||
    filterMyAdviseesOnly;

  const activePill =
    filterMyAdviseesOnly
      ? "MY_ADVISEES"
      : selectedAcademicStanding === "FAILING"
        ? "FAILING"
        : selectedPaceStatus === "BEHIND"
          ? "BEHIND"
          : selectedEngagement === "DORMANT"
            ? "DORMANT"
            : selectedAcademicStanding === "ALL" &&
                selectedPaceStatus === "ALL" &&
                selectedEngagement === "ALL" &&
                searchTerm === ""
              ? "ALL"
              : "CUSTOM";

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

      {/* 2. Top Tabs: Student Roster vs Academic Guidance Desk */}
      <div className="flex items-center justify-between border-b border-border/80 pb-1">
        <div className="flex items-center gap-2 bg-muted/50 p-1 border border-border/80 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab("DIRECTORY");
              resetPagination();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "DIRECTORY"
                ? "bg-card text-foreground shadow-2xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {filterMyAdviseesOnly ? <Users size={14} /> : <GraduationCap size={14} />}
            <span>{filterMyAdviseesOnly ? "My Advisees" : "Student Roster"}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold border border-primary/20">
              {total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("GUIDANCE")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "GUIDANCE"
                ? "bg-card text-foreground shadow-2xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCheck size={14} />
            <span>Academic Guidance Desk</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span>Total Registered:</span>
          <span className="text-foreground font-bold">{total}</span>
        </div>
      </div>

      {activeTab === "DIRECTORY" ? (
        <>
          {/* Triage Quick Filter Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedAcademicStanding("ALL");
                setSelectedPaceStatus("ALL");
                setSelectedEngagement("ALL");
                setFilterMyAdviseesOnly(false);
                resetPagination();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activePill === "ALL"
                  ? "bg-foreground text-background border-foreground shadow-2xs font-bold"
                  : "bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted/50"
              }`}
            >
              <span>All Students</span>
            </button>

            {isTeacher && (
              <button
                type="button"
                onClick={() => {
                  setSelectedAcademicStanding("ALL");
                  setSelectedPaceStatus("ALL");
                  setSelectedEngagement("ALL");
                  setFilterMyAdviseesOnly(true);
                  resetPagination();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activePill === "MY_ADVISEES"
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs font-bold"
                    : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                }`}
              >
                <UserCheck size={13} className="shrink-0" />
                <span>My Advisees</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedAcademicStanding("FAILING");
                setSelectedPaceStatus("ALL");
                setSelectedEngagement("ALL");
                setFilterMyAdviseesOnly(false);
                resetPagination();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activePill === "FAILING"
                  ? "bg-rose-500 text-white border-rose-600 shadow-2xs font-bold"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
              }`}
            >
              <AlertTriangle size={13} className="shrink-0" />
              <span>At-Risk & Failing</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPaceStatus("BEHIND");
                setSelectedAcademicStanding("ALL");
                setSelectedEngagement("ALL");
                setFilterMyAdviseesOnly(false);
                resetPagination();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activePill === "BEHIND"
                  ? "bg-amber-500 text-white border-amber-600 shadow-2xs font-bold"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
              }`}
            >
              <Clock size={13} className="shrink-0" />
              <span>Behind Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedEngagement("DORMANT");
                setSelectedAcademicStanding("ALL");
                setSelectedPaceStatus("ALL");
                setFilterMyAdviseesOnly(false);
                resetPagination();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activePill === "DORMANT"
                  ? "bg-slate-700 text-white border-slate-800 shadow-2xs font-bold dark:bg-slate-300 dark:text-slate-900"
                  : "bg-muted text-muted-foreground border-border/80 hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              <span>Dormant</span>
            </button>
          </div>

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

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Academic Standing Filter */}
              <Select
                value={selectedAcademicStanding}
                onValueChange={(v) => {
                  setSelectedAcademicStanding(v);
                  resetPagination();
                }}
              >
                <SelectTrigger className="h-9 w-[155px] bg-muted/30 border-border/80 rounded-xl text-xs font-semibold text-foreground">
                  <SelectValue placeholder="Academic Standing" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ALL">All Standings</SelectItem>
                  <SelectItem value="FAILING">🚨 Failing (&lt;75%)</SelectItem>
                  <SelectItem value="PASSING">Passing (≥75%)</SelectItem>
                  <SelectItem value="UNTESTED">Untested</SelectItem>
                </SelectContent>
              </Select>

              {/* Calendar Pace Filter */}
              <Select
                value={selectedPaceStatus}
                onValueChange={(v) => {
                  setSelectedPaceStatus(v);
                  resetPagination();
                }}
              >
                <SelectTrigger className="h-9 w-[135px] bg-muted/30 border-border/80 rounded-xl text-xs font-semibold text-foreground">
                  <SelectValue placeholder="Calendar Pace" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ALL">All Paces</SelectItem>
                  <SelectItem value="ON_TRACK">On Track</SelectItem>
                  <SelectItem value="BEHIND">Behind Schedule</SelectItem>
                  <SelectItem value="CRITICAL">Critical Lag</SelectItem>
                  <SelectItem value="NOT_SCHEDULED">Unscheduled</SelectItem>
                </SelectContent>
              </Select>

              {/* Engagement Filter */}
              <Select
                value={selectedEngagement}
                onValueChange={(v) => {
                  setSelectedEngagement(v);
                  resetPagination();
                }}
              >
                <SelectTrigger className="h-9 w-[135px] bg-muted/30 border-border/80 rounded-xl text-xs font-semibold text-foreground">
                  <SelectValue placeholder="Engagement" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ALL">All Activity</SelectItem>
                  <SelectItem value="ACTIVE">Active (≤2d)</SelectItem>
                  <SelectItem value="LOW_CADENCE">Low Cadence</SelectItem>
                  <SelectItem value="DORMANT">Dormant (5d+)</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl gap-1 cursor-pointer px-2.5"
                >
                  <RotateCcw size={12} />
                  Reset
                </Button>
              )}
            </div>
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
              !isLoading && (
                <DataTablePagination
                  currentPage={currentPage}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={currentPage > 1}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onPageSelect={handlePageSelect}
                  totalPages={totalPages}
                  totalItems={total}
                  pageSize={ITEMS_PER_PAGE}
                  itemLabel="students"
                  variant="table-footer"
                />
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
