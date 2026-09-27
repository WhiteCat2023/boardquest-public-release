import { Link } from "react-router-dom";
import { UserCheck, GraduationCap, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import appContent from "@/constants/appContent";
import { useStudents } from "@/features/students";

interface StudentRosterCardProps {
  students?: any[];
}

export function StudentRosterCard({ students: propStudents }: StudentRosterCardProps = {}) {
  const content = appContent.dashboard.studentRoster;

  // Colocated query: fetch students if not passed via props
  const shouldFetch = propStudents === undefined;
  const { data: studentData, isLoading } = useStudents({ skip: 0, take: 5 });

  const rawStudents = propStudents ?? (studentData?.students || []);
  const displayStudents = rawStudents.slice(0, 5);

  return (
    <Card className="lg:col-span-1 bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 font-sans">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <UserCheck className="text-primary size-4" />
          {content.title}
        </h2>
        <Link
          to="/student-management"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          {content.viewAllAction} <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading && shouldFetch ? (
        <div className="flex flex-col gap-2 py-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-1.5 px-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6.5 w-6.5 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-12 rounded" />
            </div>
          ))}
        </div>
      ) : displayStudents.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <GraduationCap size={30} className="mx-auto text-muted-foreground/40 mb-1.5" />
          <p className="text-xs font-semibold">{content.emptyState}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {displayStudents.map((s: any) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-1.5 px-2 bg-muted/20 hover:bg-muted/50 rounded-lg border border-border/70 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-6.5 w-6.5 border border-primary/20 bg-primary/10 text-primary shrink-0">
                  <AvatarFallback className="font-bold text-[9.5px] bg-primary/10 text-primary uppercase">
                    {(s.name || "ST").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[130px]">
                    {s.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[130px] leading-tight mt-0.5">{s.email}</p>
                </div>
              </div>

              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9.5px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
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
