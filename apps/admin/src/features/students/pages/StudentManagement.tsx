import { useState } from "react";
import {
  Search,
  RotateCcw,
  X,
  GraduationCap,
  UserCheck,
  Users,
} from "lucide-react";
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
import QuestionListPagination from "@/components/custom/pagination/QuestionListPagination";

const ITEMS_PER_PAGE = 10;

export default function StudentManagement() {
  const { isTeacher, currentUser } = useRoleFlags();
  const [activeTab, setActiveTab] = useState<"DIRECTORY" | "GUIDANCE">(
    "DIRECTORY",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [selectedStudentForGuidance, setSelectedStudentForGuidance] =
    useState<any>(null);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);

  // Pagination State (offset-based, mirrors FacultyManagement cursor-stack pattern)
  const [currentPage, setCurrentPage] = useState(1);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const { data, isLoading } = useStudents({
    search: searchTerm,
    level: selectedLevel,
    location: selectedLocation,
    advisorId: isTeacher ? currentUser?.id : undefined,
    skip,
    take: ITEMS_PER_PAGE,
  });

  const studentsList = data?.students || [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const hasNextPage = currentPage < totalPages;

  const resetPagination = () => setCurrentPage(1);

  const handleNext = () => {
    if (hasNextPage) setCurrentPage((p) => p + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handlePageSelect = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleOpenAssignGuidance = (student: any) => {
    setSelectedStudentForGuidance(student);
    setIsGuidanceModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLevel("ALL");
    setSelectedLocation("ALL");
    resetPagination();
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedLevel !== "ALL" ||
    selectedLocation !== "ALL";

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground">
      {/* 1. Header Bar */}
      <StudentHeader
        canAddStudent={!isTeacher}
        title={isTeacher ? "My Students" : "Student Directory & Advising"}
        description={
          isTeacher
            ? "View and monitor the students assigned to you for academic guidance and mentoring."
            : "Manage enrolled students, academic standing, and guidance advising."
        }
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
            {isTeacher ? <Users size={14} /> : <GraduationCap size={14} />}
            <span>{isTeacher ? "My Students" : "Student Roster"}</span>
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
          {/* 3. Search & Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card border border-border/80 p-2.5 px-3 rounded-2xl shadow-2xs w-full">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
              <Input
                type="text"
                placeholder="Search students by name, email, location..."
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
              <Select
                value={selectedLevel}
                onValueChange={(v) => {
                  setSelectedLevel(v);
                  resetPagination();
                }}
              >
                <SelectTrigger className="h-9 w-[125px] sm:w-[130px] bg-muted/30 border-border/80 rounded-xl text-xs font-semibold text-foreground">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ALL">All Levels</SelectItem>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                  <SelectItem value="4+">Level 4+</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedLocation}
                onValueChange={(v) => {
                  setSelectedLocation(v);
                  resetPagination();
                }}
              >
                <SelectTrigger className="h-9 w-[135px] bg-muted/30 border-border/80 rounded-xl text-xs font-semibold text-foreground">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ALL">All Locations</SelectItem>
                  <SelectItem value="Philippines">Philippines</SelectItem>
                  <SelectItem value="Manila">Manila</SelectItem>
                  <SelectItem value="Cebu">Cebu</SelectItem>
                  <SelectItem value="Davao">Davao</SelectItem>
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

          {/* 4. Student Directory Table */}
          <StudentTable
            students={studentsList}
            isLoading={isLoading}
            onAssignGuidance={handleOpenAssignGuidance}
            emptyTitle={
              isTeacher
                ? "No Assigned Students"
                : "No Enrolled Students Registered"
            }
            emptyDescription={
              isTeacher
                ? "You currently do not have any students assigned to you for academic guidance."
                : "No students match the selected filter criteria."
            }
          />

          {/* 5. Pagination Bar */}
          {!isLoading && totalPages > 1 && (
            <QuestionListPagination
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onPageSelect={handlePageSelect}
              maxPageReached={totalPages}
            />
          )}
        </>
      ) : (
        <GuidanceAssignmentsDesk />
      )}

      {selectedStudentForGuidance && (
        <AssignGuidanceModal
          isOpen={isGuidanceModalOpen}
          onClose={() => {
            setIsGuidanceModalOpen(false);
            setSelectedStudentForGuidance(null);
          }}
          student={selectedStudentForGuidance}
        />
      )}
    </div>
  );
}
