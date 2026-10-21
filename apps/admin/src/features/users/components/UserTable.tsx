import { Users, Building2 } from "lucide-react";
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
import { ColumnHeaderFilter } from "@/components/custom/table";
import {
  isAllowedToManageRole,
  getManagedRolesForFilter,
} from "@/features/users/utils/userUtils";

interface UserTableProps {
  users: UserMember[];
  isLoading: boolean;
  currentUserRole: RoleType;
  currentUserId: string;
  onToggleStatus: (
    id: string,
    currentStatus: boolean,
    name: string,
    role?: string,
    email?: string,
  ) => void;
  pagination?: React.ReactNode;
  activeTab?: "internal" | "external";
  selectedRole?: string;
  onRoleChange?: (val: string) => void;
  selectedStatus?: string;
  onStatusChange?: (val: string) => void;
  showRoleFilter?: boolean;
}

export default function UserTable({
  users,
  isLoading,
  currentUserRole,
  currentUserId,
  onToggleStatus,
  pagination,
  activeTab = "internal",
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  showRoleFilter: propShowRoleFilter,
}: UserTableProps) {
  const isExternal = activeTab === "external";
  const roleFilterOptions = getManagedRolesForFilter(currentUserRole);
  const showRoleFilter =
    propShowRoleFilter !== undefined
      ? propShowRoleFilter
      : !isExternal && roleFilterOptions.length > 0;
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
    <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden w-full p-0 gap-0 py-0">
      <phantom-ui loading={isLoading}>
        {!isLoading && users.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2.5">
            {isExternal ? (
              <Building2
                size={38}
                className="text-muted-foreground/40 stroke-[1.5]"
              />
            ) : (
              <Users
                size={38}
                className="text-muted-foreground/40 stroke-[1.5]"
              />
            )}
            <p className="font-bold text-foreground text-sm">
              {isExternal ? "No External Users Found" : "No Internal Users Found"}
            </p>
            <p className="text-xs max-w-xs text-muted-foreground">
              {isExternal
                ? "No review center partner accounts match the filter criteria."
                : "No internal user accounts match the filter criteria."}
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
                    {showRoleFilter && onRoleChange && selectedRole ? (
                      <ColumnHeaderFilter
                        title="Role"
                        selectedValue={selectedRole}
                        onSelect={onRoleChange}
                        options={roleFilterOptions.map((opt) => ({
                          label: opt.label,
                          value: opt.value,
                        }))}
                        allOptionLabel="All Roles"
                      />
                    ) : (
                      "Role"
                    )}
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-2.5 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    {onStatusChange && selectedStatus ? (
                      <ColumnHeaderFilter
                        title="Account Status"
                        selectedValue={selectedStatus}
                        onSelect={onStatusChange}
                        options={[
                          { label: "Active Accounts", value: "ACTIVE" },
                          { label: "Deactivated", value: "DEACTIVATED" },
                        ]}
                        allOptionLabel="All Statuses"
                      />
                    ) : (
                      "Account Status"
                    )}
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
                    key={user.id === "placeholder" ? `ph-${idx}` : user.id}
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
      {pagination}
    </Card>
  );
}

export const FacultyTable = UserTable;
