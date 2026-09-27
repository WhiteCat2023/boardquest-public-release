import { Link } from "react-router-dom";
import { Users, ShieldCheck, ArrowRight, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers } from "@/features/users";

interface FacultyRosterCardProps {
  faculties?: any[];
}

export function FacultyRosterCard({ faculties: propFaculties }: FacultyRosterCardProps = {}) {
  // Colocated query: fetch users if not passed via props
  const shouldFetch = propFaculties === undefined;
  const { data: facultyData, isLoading } = useUsers({ limit: 5 });

  const rawFaculties =
    propFaculties ??
    (Array.isArray((facultyData as any)?.faculties)
      ? (facultyData as any).faculties
      : Array.isArray(facultyData)
        ? facultyData
        : []);

  const displayFaculties = rawFaculties.slice(0, 5);

  return (
    <Card className="bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 font-sans hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Users className="text-primary size-4" />
          Users
        </h2>
        <Link
          to="/faculty-management"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          Manage Users <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading && shouldFetch ? (
        <div className="flex flex-col gap-2 py-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-14 rounded" />
            </div>
          ))}
        </div>
      ) : displayFaculties.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <User size={30} className="mx-auto text-muted-foreground/40 mb-1.5" />
          <p className="text-xs font-semibold">No users found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {displayFaculties.map((f: any) => {
            const role = f.role || (f.user?.role) || "TEACHER";
            const isTeamLead = role === "TEAMLEAD";
            return (
              <div
                key={f.id || f.email}
                className="flex items-center justify-between p-2 bg-muted/20 hover:bg-muted/50 rounded-lg border border-border/70 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-7 w-7 border border-primary/20 bg-primary/10 text-primary shrink-0">
                    <AvatarFallback className="font-bold text-[10px] bg-primary/10 text-primary uppercase">
                      {(f.name || f.email || "FC").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[150px]">
                      {f.name || f.email?.split("@")[0] || "Faculty Member"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[150px] leading-tight mt-0.5">
                      {f.email || "Faculty Member"}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={
                    isTeamLead
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[9.5px] font-bold px-2 py-0.5 rounded-md shrink-0"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[9.5px] font-bold px-2 py-0.5 rounded-md shrink-0"
                  }
                >
                  {isTeamLead ? "TEAM LEAD" : "TEACHER"}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
