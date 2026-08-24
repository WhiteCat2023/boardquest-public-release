import { Link } from "react-router-dom";
import { Plus, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import appContent from "@/constants/appContent";

export type UserRole = "SUPERADMIN" | "DEAN" | "TEAMLEAD" | "TEACHER";

interface DashboardBannerProps {
  userRole: UserRole;
  userName?: string;
}

export function DashboardBanner({
  userRole,
  userName = appContent.dashboard.banner.greetings.defaultUser,
}: DashboardBannerProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return appContent.dashboard.banner.greetings.morning;
    if (hour < 18) return appContent.dashboard.banner.greetings.afternoon;
    return appContent.dashboard.banner.greetings.evening;
  };

  const getPortalTitle = () => {
    return (
      appContent.dashboard.banner.portals[userRole] ||
      appContent.dashboard.banner.portals.DEFAULT
    );
  };

  const getPortalDescription = () => {
    return (
      appContent.dashboard.banner.descriptions[userRole] ||
      appContent.dashboard.banner.descriptions.DEAN
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs font-sans">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
          >
            {getPortalTitle()}
          </Badge>
          <span className="text-[11px] text-muted-foreground font-medium">
            &bull; {appContent.dashboard.banner.systemStatus}
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-xs text-muted-foreground">
          {getPortalDescription()}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/question-bank">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-3.5 h-8 text-xs font-bold gap-1.5 cursor-pointer shadow-xs">
            <Plus size={14} />
            {appContent.dashboard.banner.actions.addNewQuestion || "Add Question"}
          </Button>
        </Link>
        <Link to="/student-management">
          <Button
            variant="outline"
            className="bg-muted/40 hover:bg-accent border-border text-foreground rounded-xl px-3.5 h-8 text-xs font-bold gap-1.5 cursor-pointer"
          >
            <GraduationCap size={14} className="text-primary" />
            {appContent.dashboard.banner.actions.studentRoster || "Students"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
