import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Student } from "../types/types";

interface StudentProfileHeaderProps {
  student: Student;
}

export function StudentProfileHeader({ student }: StudentProfileHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      {/* Back button */}
      <button
        onClick={() => navigate("/student-management")}
        className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={16} />
        Back to Student Directory
      </button>

      {/* Hero Banner Card */}
      <Card className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-16 w-16 border-2 border-primary/20 bg-primary/10 text-primary">
              <AvatarFallback className="font-bold text-xl bg-primary/10 text-primary uppercase">
                {(student.name || "ST").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                {student.name}
              </h1>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>{student.email}</span> &bull; <span>Location: {student.location || "Philippines"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-bold gap-1 px-3 py-1 rounded-full">
              <Zap size={13} className="fill-amber-500 text-amber-500" />
              Level {student.level || 1}
            </Badge>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-xs font-bold px-3 py-1 rounded-full">
              {student.xp || 0} Total XP
            </Badge>
            <a
              href={`mailto:${student.email}`}
              className="bg-muted hover:bg-accent text-foreground font-semibold rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 transition-colors border border-border"
            >
              <Mail size={14} className="text-primary" />
              Email Student
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
