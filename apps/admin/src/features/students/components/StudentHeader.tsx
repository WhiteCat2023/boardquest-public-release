import { GraduationCap } from "lucide-react";
import AddStudentButton from "@/components/custom/button/AddStudentButton";
import ExportStudentsPdfButton from "./button/ExportStudentsPdfButton";

interface StudentHeaderProps {
  canAddStudent?: boolean;
  title?: string;
  description?: string;
  currentStanding?: string;
  currentPace?: string;
  currentEngagement?: string;
}

export default function StudentHeader({
  canAddStudent = true,
  title = "Student Directory & Advising",
  description = "Manage enrolled students, academic standing, and guidance advising.",
  currentStanding,
  currentPace,
  currentEngagement,
}: StudentHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-3.5 -mt-4 -mx-4 md:-mt-6 md:-mx-6 px-4 md:px-6 border-b border-border z-10 font-sans">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary border border-primary/20 rounded-2xl shrink-0">
          <GraduationCap className="size-5" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <ExportStudentsPdfButton
          currentStanding={currentStanding}
          currentPace={currentPace}
          currentEngagement={currentEngagement}
        />
        {canAddStudent && <AddStudentButton />}
      </div>
    </div>
  );
}

