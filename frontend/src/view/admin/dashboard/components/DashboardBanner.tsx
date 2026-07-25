import { Link } from "react-router-dom";
import { Plus, FileEdit, Clock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import appContent from "@/constants/appContent";

export type UserRole = "SUPERADMIN" | "ADMIN" | "TEAMLEAD" | "TEACHER";

interface DashboardBannerProps {
  userRole: UserRole;
  userName?: string;
  teacherDraftCount: number;
  pendingReviewQuestions: number;
}

export function DashboardBanner({
  userRole,
  userName = appContent.dashboard.banner.greetings.defaultUser,
  teacherDraftCount,
  pendingReviewQuestions,
}: DashboardBannerProps) {
  const isTeacher = userRole === "TEACHER";
  const isTeamLead = userRole === "TEAMLEAD";
  const isAdminOrSuper = userRole === "ADMIN" || userRole === "SUPERADMIN";

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
      appContent.dashboard.banner.descriptions.ADMIN
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full"
          >
            {getPortalTitle()}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">
            &bull; {appContent.dashboard.banner.systemStatus}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          {getPortalDescription()}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {isTeacher && (
          <>
            <Link to="/question-bank">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer shadow-xs">
                <Plus size={15} />
                {appContent.dashboard.banner.actions.addNewQuestion}
              </Button>
            </Link>
            <Link to="/question-bank">
              <Button
                variant="outline"
                className="bg-muted hover:bg-accent border-border text-foreground rounded-2xl px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <FileEdit size={15} className="text-primary" />
                {appContent.dashboard.banner.actions.myDrafts} ({teacherDraftCount})
              </Button>
            </Link>
          </>
        )}

        {isTeamLead && (
          <>
            <Link to="/review-center">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer shadow-xs">
                <Clock size={15} />
                {appContent.dashboard.banner.actions.reviewQueue} ({pendingReviewQuestions})
              </Button>
            </Link>
            <Link to="/question-bank">
              <Button
                variant="outline"
                className="bg-muted hover:bg-accent border-border text-foreground rounded-2xl px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <Plus size={15} className="text-primary" />
                {appContent.dashboard.banner.actions.addQuestion}
              </Button>
            </Link>
          </>
        )}

        {isAdminOrSuper && (
          <>
            <Link to="/question-bank">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer shadow-xs">
                <Plus size={15} />
                {appContent.dashboard.banner.actions.addQuestion}
              </Button>
            </Link>
            <Link to="/student-management">
              <Button
                variant="outline"
                className="bg-muted hover:bg-accent border-border text-foreground rounded-2xl px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <GraduationCap size={15} className="text-primary" />
                {appContent.dashboard.banner.actions.studentRoster}
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
