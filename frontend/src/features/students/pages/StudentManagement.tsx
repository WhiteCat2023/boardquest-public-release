import { useState } from "react";
import { Search, RotateCcw, X, GraduationCap, UserCheck } from "lucide-react";
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
import StudentHeader from "../components/StudentHeader";
import StudentTable from "../components/StudentTable";
import GuidanceAssignmentsDesk from "../components/GuidanceAssignmentsDesk";
import AssignGuidanceModal from "../components/AssignGuidanceModal";
import QuestionListPagination from "@/components/custom/pagination/QuestionListPagination";

const ITEMS_PER_PAGE = 10;

export default function StudentManagement() {
  const [activeTab, setActiveTab] = useState<"DIRECTORY" | "GUIDANCE">("DIRECTORY");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [selectedStudentForGuidance, setSelectedStudentForGuidance] = useState<any>(null);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);

  // Pagination State (offset-based, mirrors FacultyManagement cursor-stack pattern)
  const [currentPage, setCurrentPage] = useState(1);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const { data, isLoading } = useStudents({
    search: searchTerm,
    level: selectedLevel,
    location: selectedLocation,
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
    searchTerm.trim() !== "" || selectedLevel !== "ALL" || selectedLocation !== "ALL";

  return (
    <div className="flex flex-col gap-3.5 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <StudentHeader
          title="Student Directory & Enrollment"
          description="Manage enrolled students, academic programs, and evaluation eligibility."
        />

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-muted/40 p-1 border border-border rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("DIRECTORY")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "DIRECTORY"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GraduationCap size={14} className="inline mr-1.5" />
            Enrolled Students ({total})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("GUIDANCE")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "GUIDANCE"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCheck size={14} />
            Academic Guidance Desk
          </button>
        </div>
      </div>

      {activeTab === "DIRECTORY" ? (
        <>
          {/* Search & Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-card border border-border p-2.5 px-3.5 rounded-xl shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
              <Input
                type="text"
                placeholder="Search students by name, email, location..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  resetPagination();
                }}
                className="pl-9 pr-8 h-8 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:ring-1 focus:ring-ring/20 focus:border-primary placeholder:text-muted-foreground"
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(""); resetPagination(); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedLevel} onValueChange={(v) => { setSelectedLevel(v); resetPagination(); }}>
                <SelectTrigger className="h-8 w-[125px] bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground">
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

              <Select value={selectedLocation} onValueChange={(v) => { setSelectedLocation(v); resetPagination(); }}>
                <SelectTrigger className="h-8 w-[135px] bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground">
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
                  className="h-8 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg gap-1 cursor-pointer px-2.5"
                >
                  <RotateCcw size={12} />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Student Directory Table */}
          <StudentTable
            students={studentsList}
            isLoading={isLoading}
            onAssignGuidance={handleOpenAssignGuidance}
          />

          {/* Pagination Bar */}
          {!isLoading && (
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
