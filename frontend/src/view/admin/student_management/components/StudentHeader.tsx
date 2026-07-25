import { GraduationCap } from "lucide-react";
import AddStudentButton from "@/components/custom/button/AddStudentButton";

interface StudentHeaderProps {
  canAddStudent?: boolean;
}

export default function StudentHeader({ canAddStudent = true }: StudentHeaderProps) {
  return (
    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md pb-4 pt-6 -mt-6 -mx-6 md:-mt-8 md:-mx-8 px-6 md:px-8 border-b border-border z-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
          <GraduationCap className="text-primary" size={26} />
          Student Directory & Enrollment
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
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
