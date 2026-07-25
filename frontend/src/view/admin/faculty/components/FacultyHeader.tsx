import { Users } from "lucide-react";
import AddFacultyButton from "@/components/custom/button/AddFacultyButton";

interface FacultyHeaderProps {
  canAddFaculty: boolean;
}

export default function FacultyHeader({ canAddFaculty }: FacultyHeaderProps) {
  return (
    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md pb-4 pt-6 -mt-6 -mx-6 md:-mt-8 md:-mx-8 px-6 md:px-8 border-b border-border z-10 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
          <Users className="text-primary" />
          Faculty & Administrative Directory
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
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
