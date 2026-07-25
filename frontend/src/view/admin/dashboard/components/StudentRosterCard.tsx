import { Link } from "react-router-dom";
import { UserCheck, GraduationCap, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import appContent from "@/constants/appContent";

interface StudentRosterCardProps {
  students: any[];
}

export function StudentRosterCard({ students }: StudentRosterCardProps) {
  const content = appContent.dashboard.studentRoster;
  const displayStudents = students.slice(0, 5);

  return (
    <Card className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <UserCheck className="text-primary" size={18} />
          {content.title}
        </h2>
        <Link
          to="/student-management"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          {content.viewAllAction} <ArrowRight size={13} />
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <GraduationCap size={36} className="mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-xs font-semibold">{content.emptyState}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayStudents.map((s: any) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-2.5 bg-muted/40 rounded-2xl border border-border"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-primary/20 bg-primary/10 text-primary">
                  <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary uppercase">
                    {(s.name || "ST").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-bold text-foreground leading-snug">
                    {s.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{s.email}</p>
                </div>
              </div>

              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold"
              >
                {content.levelPrefix} {s.level || 1}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
