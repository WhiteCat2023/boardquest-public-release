import { Link } from "react-router-dom";
import { Plus, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import appContent from "@/constants/appContent";

export type UserRole = "SUPERADMIN" | "DEAN" | "TEAMLEAD" | "TEACHER" | number | string;

interface DashboardBannerProps {
  userRole: UserRole;
  userName?: string;
}

export function DashboardBanner({
  userRole,
  userName = appContent.dashboard.banner.greetings.defaultUser,
}: DashboardBannerProps) {
  const getNormalizedKey = (): string => {
    const s = String(userRole || "").toUpperCase();
    if (s === "SUPERADMIN") return "SUPERADMIN";
    if (s === "DEAN") return "DEAN";
    if (s === "TEAMLEAD") return "TEAMLEAD";
    if (s === "TEACHER") return "TEACHER";
    return "DEAN";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return appContent.dashboard.banner.greetings.morning;
    if (hour < 18) return appContent.dashboard.banner.greetings.afternoon;
    return appContent.dashboard.banner.greetings.evening;
  };

  const getPortalTitle = () => {
    const key = getNormalizedKey();
    return (
      (appContent.dashboard.banner.portals as any)[key] ||
      appContent.dashboard.banner.portals.DEFAULT
    );
  };

  const getPortalDescription = () => {
    const key = getNormalizedKey();
    return (
      (appContent.dashboard.banner.descriptions as any)[key] ||
      appContent.dashboard.banner.descriptions.DEAN
    );
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs font-sans">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider"
          >
            {getPortalTitle()}
          </Badge>
          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
            {appContent.dashboard.banner.systemStatus}
          </span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
          {getGreeting()}, {userName}
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
