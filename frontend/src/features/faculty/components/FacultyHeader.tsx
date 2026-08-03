import { Users } from "lucide-react";
import AddFacultyButton from "@/components/custom/button/AddFacultyButton";

interface FacultyHeaderProps {
  canAddFaculty: boolean;
}

export default function FacultyHeader({ canAddFaculty }: FacultyHeaderProps) {
  return (
    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-3.5 -mt-4 -mx-4 md:-mt-6 md:-mx-6 px-4 md:px-6 border-b border-border z-10 font-sans">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Users className="text-primary size-5" />
          User Directory
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage academic staff, course leads, and administrator privileges.
        </p>
      </div>

      {canAddFaculty && (
        <div className="flex items-center gap-2">
          <AddFacultyButton />
        </div>
      )}
    </div>
  );
}
