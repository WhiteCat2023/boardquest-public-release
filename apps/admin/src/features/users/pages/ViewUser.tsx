import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/features/users/api/useUsers";
import type { RoleType } from "@/features/users/types/types";
import useRoleFlags from "@/hooks/useRoleFlags";
import {
  ViewUserHeader,
  ViewUserNavTabs,
  UserPersonalDetailsTab,
  UserHandledSubjectsTab,
  UserActivityLogsTab,
  type ViewUserTab,
} from "@/features/users/components/view";

export default function ViewUser() {
  const { facultyId, userId } = useParams<{
    facultyId?: string;
    userId?: string;
  }>();
  const targetId = userId || facultyId;

  const { currentUser, userRole } = useRoleFlags();
  const currentUserRole = userRole as RoleType;

  const { data: userResponse, isLoading } = useUsers();
  const users = userResponse?.users || userResponse?.faculties || [];
  const member = users.find((f) => f.id === targetId);

  const [activeTab, setActiveTab] = useState<ViewUserTab>("details");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-sans text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">
            Loading user profile...
          </p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center font-sans text-foreground">
        <div className="p-4 bg-muted text-muted-foreground rounded-full">
          <User size={36} />
        </div>
        <h2 className="text-lg font-bold text-foreground">User Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          The user profile you are trying to view does not exist or may have
          been removed.
        </p>
        <Link to="/faculty-management">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 py-2 text-xs font-semibold cursor-pointer shadow-xs">
            Return to Users Directory
          </Button>
        </Link>
      </div>
    );
  }

  const isExternal =
    String(member.role) === "EXTERNAL" ||
    String(member.role) === "REVIEWCENTER";

  const canManageCategories =
    String(currentUserRole) === "DEAN" ||
    String(currentUserRole) === "SUPERADMIN";

  return (
    <div className="flex-1 w-full min-h-0 overflow-y-auto font-sans bg-background text-foreground">
      <div className="flex flex-col gap-4 p-3 sm:p-5 md:p-6 w-full max-w-7xl mx-auto animate-in fade-in duration-300 font-sans pb-20">
        <ViewUserHeader
          user={member}
          currentUserId={currentUser?.id}
          currentUserRole={currentUserRole}
        />

        <ViewUserNavTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isExternal={isExternal}
        />

        {activeTab === "details" && <UserPersonalDetailsTab user={member} />}

        {activeTab === "subjects" && !isExternal && (
          <UserHandledSubjectsTab
            user={member}
            canManageCategories={canManageCategories}
          />
        )}

        {activeTab === "activity" && (
          <UserActivityLogsTab
            userEmail={member.email}
            lastActiveAt={member.lastActiveAt}
          />
        )}
      </div>
    </div>
  );
}

export const ViewFacultyMember = ViewUser;
