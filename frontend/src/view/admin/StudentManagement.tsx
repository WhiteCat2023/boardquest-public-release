import { useState } from "react";
import { Search, GraduationCap, RotateCcw, X } from "lucide-react";
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
    <div className="flex flex-col gap-6 p-8 w-full min-h-full font-sans bg-slate-50/50">
      <StudentHeader />

      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <Input
            type="text"
            placeholder="Search students by name, email, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-9 h-10 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Level Filter */}
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="h-10 w-[140px] bg-slate-50/50 border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
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
            <SelectTrigger className="h-10 w-[150px] bg-slate-50/50 border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
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
              className="h-10 text-xs font-semibold text-slate-500 hover:text-[#A70202] hover:bg-red-50 rounded-xl gap-1.5 cursor-pointer px-3"
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
