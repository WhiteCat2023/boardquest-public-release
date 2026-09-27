import { Link } from "react-router-dom";
import { Plus, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import appContent from "@/constants/appContent";
import useRoleFlags from "@/hooks/useRoleFlags";

export function DashboardBanner() {
  const {isTeacher, isDean, isSuperAdmin, isTeamLead, currentUser} = useRoleFlags();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return appContent.dashboard.banner.greetings.morning;
    if (hour < 18) return appContent.dashboard.banner.greetings.afternoon;
    return appContent.dashboard.banner.greetings.evening;
  };

  const getPortalDescription = () => {
    if(isTeacher)return appContent.dashboard.banner.descriptions.TEACHER;
    if(isDean)return appContent.dashboard.banner.descriptions.DEAN;
    if(isSuperAdmin)return appContent.dashboard.banner.descriptions.SUPERADMIN;
    if(isTeamLead)return appContent.dashboard.banner.descriptions.TEAMLEAD;
    return appContent.dashboard.banner.descriptions.TEAMLEAD;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card font-sans">
      <div className="space-y-0.5">
        <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
          {getGreeting()}, {currentUser?.name}
        </h1>
        <p className="text-xs text-muted-foreground">
          {getPortalDescription()}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <Link to="/question-bank">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3 h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs">
            <Plus size={14} />
            {appContent.dashboard.banner.actions.addNewQuestion || "Add Question"}
          </Button>
        </Link>
        <Link to="/student-management">
          <Button
            variant="outline"
            className="bg-card hover:bg-accent border-border text-foreground rounded-lg px-3 h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs"
          >
            <GraduationCap size={14} className="text-primary" />
            {appContent.dashboard.banner.actions.studentRoster || "Students"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
