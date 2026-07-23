import { GraduationCap } from "lucide-react";
import AddStudentButton from "@/components/custom/button/AddStudentButton";

interface StudentHeaderProps {
  canAddStudent?: boolean;
}

export default function StudentHeader({ canAddStudent = true }: StudentHeaderProps) {
  return (
    <div className="flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur-md pb-4 pt-8 -mt-8 -mx-8 px-8 border-b border-slate-100 z-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <GraduationCap className="text-[#A70202]" size={26} />
          Student Directory & Enrollment
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage enrolled students, academic programs, and evaluation eligibility.
        </p>
      </div>

      {canAddStudent && (
        <div className="flex items-center gap-3">
          <AddStudentButton />
        </div>
      )}
    </div>
  );
}
