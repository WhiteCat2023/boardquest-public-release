import CategoriesView from "../question_bank/components/CategoriesView";

export default function SubjectManagement() {
  return (
    <div className="flex flex-col gap-6 p-8 w-full min-h-full">
      {/* Page header */}
      <div className="flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur-md pb-4 pt-8 -mt-8 -mx-8 px-8 transition-colors duration-200 z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Subject Management
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Browse and manage evaluation subject categories across the curriculum.
          </p>
        </div>
      </div>

      <CategoriesView />
    </div>
  );
}
