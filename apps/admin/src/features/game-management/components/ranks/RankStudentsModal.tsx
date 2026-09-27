import React, { useState } from "react";
import { Search, GraduationCap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RankTier } from "../../types/types";
import { useRankStudents } from "../../api/useGameManagement";
import { getRankIcon } from "./rankIcons";

interface RankStudentsModalProps {
  rank: RankTier | null;
  onClose: () => void;
}

export default function RankStudentsModal({
  rank,
  onClose,
}: RankStudentsModalProps) {
  const [studentSearch, setStudentSearch] = useState("");

  const { data: rankStudentsData, isLoading: isStudentsLoading } =
    useRankStudents(rank ? rank.id : null, { search: studentSearch });

  const IconComp = getRankIcon(rank?.icon);

  return (
    <Dialog
      open={Boolean(rank)}
      onOpenChange={(open) => {
        if (!open) {
          setStudentSearch("");
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 border-border/80 bg-card overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
              style={{ backgroundColor: rank?.color || "#3B82F6" }}
            >
              <IconComp className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {rank?.title} — Enrolled Students
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Real MongoDB student records currently in Level{" "}
                {rank?.minLevel} {rank?.maxLevel ? `– ${rank.maxLevel}` : "+"}.
              </DialogDescription>
            </div>
          </div>

          {/* Student Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search students by name or email..."
              className="pl-8 h-8 text-xs"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {isStudentsLoading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-muted/30 animate-pulse"
                />
              ))}
            </div>
          ) : !rankStudentsData?.students ||
            rankStudentsData.students.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h5 className="text-xs font-bold text-foreground">
                No students in this rank tier yet
              </h5>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto mt-1">
                Students will automatically appear here when they reach Level{" "}
                {rank?.minLevel} through gameplay and study quizzes.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Total Students: {rankStudentsData.students.length}
              </div>
              {rankStudentsData.students.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {st.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        {st.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {st.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="text-xs font-extrabold text-foreground">
                        Level {st.level}
                      </div>
                      <div className="text-[10px] font-bold text-primary">
                        {st.xp?.toLocaleString() || 0} XP
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border/60 bg-muted/10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setStudentSearch("");
              onClose();
            }}
            className="text-xs cursor-pointer"
          >
            Close Directory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
