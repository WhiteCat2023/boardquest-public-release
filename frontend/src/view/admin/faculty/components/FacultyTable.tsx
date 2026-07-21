import { Users } from "lucide-react";
import type { FacultyMember, RoleType } from "../types";
import { isAllowedToManageRole } from "../utils/facultyUtils";
import FacultyTableRow from "./FacultyTableRow";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table";

interface FacultyTableProps {
  faculties: FacultyMember[];
  isLoading: boolean;
  currentUserRole: RoleType;
  currentUserId: string;
  onToggleStatus: (id: string, currentStatus: boolean, name: string) => void;
  onDelete: (id: string, name: string, role: RoleType) => void;
}

export default function FacultyTable({
  faculties,
  isLoading,
  currentUserRole,
  currentUserId,
  onToggleStatus,
  onDelete,
}: FacultyTableProps) {
  return (
    <Card className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden w-full p-0">
      {isLoading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="animate-spin inline-block border-3 border-[#A70202] border-t-transparent rounded-full w-8 h-8 mb-4"></div>
          <p className="text-sm font-medium">Fetching directory listings...</p>
        </div>
      ) : faculties.length === 0 ? (
        <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Users size={48} className="text-slate-300 stroke-[1.5]" />
          <p className="font-bold text-slate-600">No Administrators Registered</p>
          <p className="text-sm max-w-sm">No administrators or teachers have been added to the system yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <Table className="w-full text-left border-collapse">
            <TableHeader className="bg-slate-50/50 border-b border-slate-100">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 h-auto">
                  Employee Profile
                </TableHead>
                <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 h-auto">
                  Contact Details
                </TableHead>
                <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 h-auto">
                  Scope / Department
                </TableHead>
                <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 h-auto">
                  Handled Subjects
                </TableHead>
                <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 h-auto">
                  Authority Role
                </TableHead>
                <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 h-auto">
                  Account Status
                </TableHead>
                <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 h-auto">
                  Last Activity
                </TableHead>
                <TableHead className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right h-auto">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {faculties.map((member) => {
                const canManage =
                  member.id !== currentUserId &&
                  isAllowedToManageRole(currentUserRole, member.role);
                return (
                  <FacultyTableRow
                    key={member.id}
                    member={member}
                    canManage={canManage}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
