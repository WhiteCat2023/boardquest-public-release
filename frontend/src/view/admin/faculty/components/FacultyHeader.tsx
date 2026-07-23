import { Users } from "lucide-react";
import AddFacultyButton from "@/components/custom/button/AddFacultyButton";

interface FacultyHeaderProps {
  canAddFaculty: boolean;
}

export default function FacultyHeader({ canAddFaculty }: FacultyHeaderProps) {
  return (
    <div className="flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur-md pb-4 pt-8 -mt-8 -mx-8 px-8 border-b border-slate-100 z-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <Users className="text-[#A70202]" />
          Faculty & Administrative Directory
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage academic staff, course leads, and administrator privileges.
        </p>
      </div>

      {canAddFaculty && (
        <div className="flex items-center gap-3">
          <AddFacultyButton />
        </div>
      )}
    </div>
  );
}
