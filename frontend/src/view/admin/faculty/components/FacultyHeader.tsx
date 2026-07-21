import { Link } from "react-router-dom";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Link to="/faculty-management/create">
          <Button className="bg-[#A70202] text-white hover:bg-[#8f0101] rounded-xl px-5 py-2.5 flex items-center gap-2 font-semibold shadow-sm transition-all duration-200 cursor-pointer">
            <UserPlus size={16} />
            Add Faculty Member
          </Button>
        </Link>
      )}
    </div>
  );
}
