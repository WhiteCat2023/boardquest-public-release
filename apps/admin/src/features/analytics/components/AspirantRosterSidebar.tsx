import { useState } from "react";
import { Search, X, Users, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useRoleFlags from "@/hooks/useRoleFlags";
import type { StudentListItem } from "../types/types";

interface AspirantRosterSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredStudents: StudentListItem[];
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string) => void;
  onStudentSelected?: () => void;
  className?: string;
}

export function AspirantRosterSidebar({
  searchQuery,
  setSearchQuery,
  filteredStudents,
  selectedStudentId,
  setSelectedStudentId,
  onStudentSelected,
  className = "",
}: AspirantRosterSidebarProps) {
  const { isTeacher, currentUser } = useRoleFlags();
  const [filterMode, setFilterMode] = useState<"HANDLED" | "ALL">(isTeacher ? "HANDLED" : "ALL");

  const currentTeacherId = currentUser?.id;

  const displayStudents = filteredStudents.filter((s) => {
    if (!isTeacher || filterMode === "ALL") return true;
    return s.guidanceAssignments?.some((g) => g.advisorId === currentTeacherId);
  });

  const handledCount = filteredStudents.filter((s) =>
    s.guidanceAssignments?.some((g) => g.advisorId === currentTeacherId)
  ).length;

  const handleSelect = (id: string) => {
    setSelectedStudentId(id);
    onStudentSelected?.();
  };

  return (
    <div className={`flex flex-col h-full bg-card/60 backdrop-blur-sm min-w-0 ${className}`}>
      {/* Search Header */}
      <div className="p-3 border-b border-border/60 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Users size={13} className="text-primary" />
            Students Roster
          </h2>
          <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 rounded-md bg-muted/50 border-border">
            {displayStudents.length} Total
          </Badge>
        </div>

        {/* Teacher Handled Toggle */}
        {isTeacher && (
          <div className="flex items-center gap-1 bg-muted/40 p-0.5 border border-border rounded-lg">
            <button
              type="button"
              onClick={() => setFilterMode("HANDLED")}
              className={`flex-1 py-1 text-[10.5px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                filterMode === "HANDLED"
                  ? "bg-card text-primary shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck size={11} />
              My Handled ({handledCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("ALL")}
              className={`flex-1 py-1 text-[10.5px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                filterMode === "ALL"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users size={11} />
              All ({filteredStudents.length})
            </button>
          </div>
        )}

        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-7 h-8 text-xs bg-muted/30 border-border/70 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/70"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/30 scrollbar-thin min-h-0">
        {displayStudents.length === 0 ? (
          <div className="p-6 text-center flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground font-medium italic">
              {filterMode === "HANDLED"
                ? "You currently have 0 assigned guidance students."
                : "No matching aspirants found."}
            </p>
            {filterMode === "HANDLED" && (
              <button
                type="button"
                onClick={() => setFilterMode("ALL")}
                className="text-[11px] font-bold text-primary hover:underline bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                View All Enrolled Students ({filteredStudents.length})
              </button>
            )}
          </div>
        ) : (
          displayStudents.map((s: StudentListItem) => {
            const isSelected = selectedStudentId === s.id;
            const isHandledByMe = s.guidanceAssignments?.some((g) => g.advisorId === currentTeacherId);
            const initials = (s.name || "ST").slice(0, 2).toUpperCase();
            return (
              <div
                key={s.id}
                onClick={() => handleSelect(s.id)}
                className={`p-2.5 cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                  isSelected 
                    ? "bg-primary/10 border-l-3 border-primary text-primary font-semibold shadow-2xs" 
                    : "hover:bg-accent/60 border-l-3 border-transparent text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className={`text-[10px] font-black ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold text-foreground truncate leading-tight">{s.name}</span>
                      {isHandledByMe && (
                        <Badge variant="outline" className="text-[8px] px-1 py-0 rounded font-bold bg-primary/10 text-primary border-primary/20 shrink-0">
                          Handled
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate leading-tight">{s.email}</span>
                  </div>
                </div>
                <Badge 
                  variant={isSelected ? "default" : "outline"} 
                  className="text-[9px] font-extrabold shrink-0 px-1.5 py-0 rounded-md"
                >
                  Lvl {s.level}
                </Badge>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

