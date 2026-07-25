import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, RotateCcw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudents } from "./student_management/hooks/useStudent";
import StudentHeader from "./student_management/components/StudentHeader";
import StudentTable from "./student_management/components/StudentTable";

export default function StudentManagement() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "students";
  const isEvaluation = view === "evaluation";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");

  const { data, isLoading } = useStudents(0, 100);
  const studentsList = data?.students || [];

  // Extract unique locations dynamically
  const uniqueLocations = Array.from(
    new Set(studentsList.map((s) => s.location || "Philippines").filter(Boolean))
  );

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLevel("ALL");
    setSelectedLocation("ALL");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" || selectedLevel !== "ALL" || selectedLocation !== "ALL";

  // Filter Logic
  const filteredStudents = studentsList.filter((s) => {
    const matchSearch =
      !searchTerm.trim() ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.location && s.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchLevel =
      selectedLevel === "ALL" ||
      (selectedLevel === "1" && s.level === 1) ||
      (selectedLevel === "2" && s.level === 2) ||
      (selectedLevel === "3" && s.level === 3) ||
      (selectedLevel === "4+" && s.level >= 4);

    const studentLoc = s.location || "Philippines";
    const matchLocation =
      selectedLocation === "ALL" ||
      studentLoc.toLowerCase() === selectedLocation.toLowerCase();

    return matchSearch && matchLevel && matchLocation;
  });

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 w-full min-h-full font-sans bg-background text-foreground">
      <StudentHeader
        title={isEvaluation ? "Students Evaluation" : "Student Directory & Enrollment"}
        description={
          isEvaluation
            ? "Track student performance, exam evaluation history, and academic progress."
            : "Manage enrolled students, academic programs, and evaluation eligibility."
        }
      />

      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            type="text"
            placeholder="Search students by name, email, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-9 h-10 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-ring/20 focus:border-primary placeholder:text-muted-foreground"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Level Filter */}
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="h-10 w-[140px] bg-muted/40 border-border rounded-xl text-xs font-semibold text-foreground">
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

          {/* Location Filter */}
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="h-10 w-[150px] bg-muted/40 border-border rounded-xl text-xs font-semibold text-foreground">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="ALL">All Locations</SelectItem>
              {uniqueLocations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-10 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl gap-1.5 cursor-pointer px-3"
            >
              <RotateCcw size={13} />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Directory Table */}
      <StudentTable students={filteredStudents} isLoading={isLoading} />
    </div>
  );
}
