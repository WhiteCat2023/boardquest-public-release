import { Link } from "react-router-dom";
import { Users, ShieldCheck, ArrowRight, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface FacultyRosterCardProps {
  faculties: any[];
}

export function FacultyRosterCard({ faculties }: FacultyRosterCardProps) {
  const displayFaculties = (Array.isArray(faculties) ? faculties : []).slice(0, 5);

  return (
    <Card className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-2xs flex flex-col gap-3 font-sans hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Users className="text-primary size-4" />
          Faculty Members
        </h2>
        <Link
          to="/faculty-management"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          Manage Faculty <ArrowRight size={12} />
        </Link>
      </div>

      {displayFaculties.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <User size={30} className="mx-auto text-muted-foreground/40 mb-1.5" />
          <p className="text-xs font-semibold">No faculty members found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayFaculties.map((f: any) => {
            const role = f.role || (f.user?.role) || "TEACHER";
            const isTeamLead = role === "TEAMLEAD";
            return (
              <div
                key={f.id || f.email}
                className="flex items-center justify-between p-2.5 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 border border-primary/20 bg-primary/10 text-primary shrink-0">
                    <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary uppercase">
                      {(f.name || f.email || "FC").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground leading-snug truncate max-w-[150px]">
                      {f.name || f.email?.split("@")[0] || "Faculty Member"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                      {f.email || f.department?.name || "Faculty Department"}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={
                    isTeamLead
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
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
