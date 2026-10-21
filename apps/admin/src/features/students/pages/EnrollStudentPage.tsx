import { useSearchParams } from "react-router-dom";
import {
  EnrollStudentHeader,
  IndividualEnrollForm,
  BulkEnrollTab,
} from "../components/enroll";

export default function EnrollStudentPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: "individual" | "bulk"
  const tabParam = searchParams.get("tab");
  const activeTab: "individual" | "bulk" = tabParam === "bulk" ? "bulk" : "individual";

  const handleTabChange = (tab: "individual" | "bulk") => {
    if (tab === activeTab) return;
    const newParams = new URLSearchParams(searchParams);
    if (tab === "individual") {
      newParams.delete("tab");
    } else {
      newParams.set("tab", tab);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Header & Back Navigation */}
      <EnrollStudentHeader activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab 1: Individual Student Enrollment */}
      {activeTab === "individual" && <IndividualEnrollForm />}

      {/* Tab 2: Bulk CSV Student Enrollment */}
      {activeTab === "bulk" && <BulkEnrollTab />}
    </div>
  );
}
