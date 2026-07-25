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
    <Card className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden w-full p-0">
      <phantom-ui loading={isLoading}>
        {!isLoading && faculties.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
            <Users size={48} className="text-muted-foreground/40 stroke-[1.5]" />
            <p className="font-bold text-foreground">
              No Administrators Registered
            </p>
            <p className="text-sm max-w-sm">
              No administrators or teachers have been added to the system yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full text-left border-collapse">
              <TableHeader
                className="bg-muted/40 border-b border-border"
                data-shimmer-ignore
              >
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Employee Profile
                  </TableHead>
                  <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Scope / Department
                  </TableHead>
                  <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Authority Role
                  </TableHead>
                  <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Account Status
                  </TableHead>
                  <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Last Activity
                  </TableHead>
                  <TableHead className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right h-auto">
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
