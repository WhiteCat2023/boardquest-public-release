import { BookOpen } from "lucide-react";
import CategoriesView from "./CategoriesView";

export default function SubjectManagement() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground">
      {/* Page header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-3.5 -mt-4 -mx-4 md:-mt-6 md:-mx-6 px-4 md:px-6 border-b border-border z-10 font-sans">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BookOpen className="text-primary size-5" />
            Subject Directory & Module Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage subject categories, assigned faculty handlers, and learning curriculum modules.
          </p>
        </div>
      </div>

      <CategoriesView />
    </div>
  );
}
