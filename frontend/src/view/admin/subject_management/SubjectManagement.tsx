import CategoriesView from "../question_bank/components/CategoriesView";

export default function SubjectManagement() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 w-full min-h-full font-sans bg-background text-foreground">
      {/* Page header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md pb-4 pt-6 -mt-6 -mx-6 md:-mt-8 md:-mx-8 px-6 md:px-8 border-b border-border transition-colors duration-200 z-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Subject Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse and manage evaluation subject categories across the curriculum.
          </p>
        </div>
      </div>

      <CategoriesView />
    </div>
  );
}
