import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { StudentListItem } from "../types/types";

interface AspirantRosterSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredStudents: StudentListItem[];
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string) => void;
}

export function AspirantRosterSidebar({
  searchQuery,
  setSearchQuery,
  filteredStudents,
  selectedStudentId,
  setSelectedStudentId
}: AspirantRosterSidebarProps) {
  return (
    <div className="w-full lg:w-72 shrink-0 border-r border-border/80 bg-card/60 backdrop-blur-sm flex flex-col h-full">
      {/* Search Header */}
      <div className="p-3 border-b border-border/60 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Search size={13} className="text-primary" />
            Aspirant Roster
          </h2>
          <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 rounded-md bg-muted/50 border-border">
            {filteredStudents.length} Students
          </Badge>
        </div>
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
      <div className="flex-1 overflow-y-auto divide-y divide-border/30 scrollbar-thin">
        {filteredStudents.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground font-medium italic">
            No matching aspirants found.
          </div>
        ) : (
          filteredStudents.map((s: StudentListItem) => {
            const isSelected = selectedStudentId === s.id;
            const initials = (s.name || "ST").slice(0, 2).toUpperCase();
            return (
              <div
                key={s.id}
                onClick={() => setSelectedStudentId(s.id)}
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
                    <span className="text-xs font-bold text-foreground truncate leading-tight">{s.name}</span>
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
