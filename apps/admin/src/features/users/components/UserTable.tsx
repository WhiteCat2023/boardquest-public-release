import { Users } from "lucide-react";
import type { UserMember, RoleType } from "@/features/users";
import UserTableRow from "./UserTableRow";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { isAllowedToManageRole } from "@/features/users/utils/userUtils";

interface UserTableProps {
  users: UserMember[];
  isLoading: boolean;
  currentUserRole: RoleType;
  currentUserId: string;
  onToggleStatus: (id: string, currentStatus: boolean, name: string) => void;
}

export default function UserTable({
  users,
  isLoading,
  currentUserRole,
  currentUserId,
  onToggleStatus,
}: UserTableProps) {
  const displayUsers =
    isLoading && users.length === 0
      ? (Array(5).fill({
          id: "placeholder",
          name: "Loading User Name",
          email: "loading.user@university.edu",
          role: "TEACHER",
          accountStatus: "ACTIVE",
          isActive: true,
          handledSubjects: [{ id: "1", name: "Subject" }],
        }) as UserMember[])
      : users;

  return (
    <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden w-full p-0">
      <phantom-ui loading={isLoading}>
        {!isLoading && users.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2.5">
            <Users
              size={38}
              className="text-muted-foreground/40 stroke-[1.5]"
            />
            <p className="font-bold text-foreground text-sm">
              No Users Registered
            </p>
            <p className="text-xs max-w-xs text-muted-foreground">
              No users match the filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full text-left border-collapse">
              <TableHeader
                className="bg-muted/50 border-b border-border"
                data-shimmer-ignore
              >
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="py-2.5 px-4 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    User Profile
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-2.5 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Role
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-2.5 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Account Status
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-2.5 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Last Login Activity
                  </TableHead>
                  <TableHead className="py-2.5 px-4 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground text-right h-auto">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {displayUsers.map((user, idx) => (
                  <UserTableRow
                    key={
                      user.id === "placeholder" ? `ph-${idx}` : user.id
                    }
                    member={user}
                    canManage={
                      user.id !== currentUserId &&
                      isAllowedToManageRole(currentUserRole, user.role)
                    }
                    onToggleStatus={onToggleStatus}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </phantom-ui>
    </Card>
  );
}

export const FacultyTable = UserTable;
