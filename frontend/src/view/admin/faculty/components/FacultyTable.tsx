import { Users } from "lucide-react";
import type { FacultyMember, RoleType } from "../types";
import FacultyTableRow from "./FacultyTableRow";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table";
import { isAllowedToManageRole } from "../utils/facultyUtils";

interface FacultyTableProps {
  faculties: FacultyMember[];
  isLoading: boolean;
  currentUserRole: RoleType;
  currentUserId: string;
  onToggleStatus: (id: string, currentStatus: boolean, name: string) => void;
}

export default function FacultyTable({
  faculties,
  isLoading,
  currentUserRole,
  currentUserId,
  onToggleStatus,
}: FacultyTableProps) {
  const displayFaculties =
    isLoading && faculties.length === 0
      ? (Array(5).fill({
          id: "placeholder",
          name: "Loading Faculty Name",
          email: "loading.faculty@university.edu",
          role: "TEACHER",
          isActive: true,
          department: { name: "Department Name" },
          handledCategories: [{ id: "1", name: "Category" }],
        }) as FacultyMember[])
      : faculties;

  return (
    <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden w-full p-0">
      <phantom-ui loading={isLoading}>
        {!isLoading && faculties.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2.5">
            <Users size={38} className="text-muted-foreground/40 stroke-[1.5]" />
            <p className="font-bold text-foreground text-sm">
              No Administrators Registered
            </p>
            <p className="text-xs max-w-xs text-muted-foreground">
              No administrators or faculty members match the filter criteria.
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
                    Employee Profile
                  </TableHead>
                  {/* <TableHead className="py-2.5 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Department
                  </TableHead> */}
                  <TableHead className="py-2.5 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Authority Role
                  </TableHead>
                  <TableHead className="py-2.5 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Account Status
                  </TableHead>
                  <TableHead className="py-2.5 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Last Activity
                  </TableHead>
                  <TableHead className="py-2.5 px-4 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground text-right h-auto">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {displayFaculties.map((faculty, idx) => (
                  <FacultyTableRow
                    key={
                      faculty.id === "placeholder" ? `ph-${idx}` : faculty.id
                    }
                    member={faculty}
                    canManage={
                      faculty.id !== currentUserId &&
                      isAllowedToManageRole(currentUserRole, faculty.role)
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
