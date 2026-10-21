import { useNavigate, useSearchParams } from "react-router-dom";
import AddUserHeader from "../components/AddUserHeader";
import AddIndividualUserTab from "../components/AddIndividualUserTab";
import AddBulkUserTab from "../components/AddBulkUserTab";
import AddExternalUserTab from "../components/AddExternalUserTab";

export default function AddUser() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Account Category: "internal" | "external"
  const typeParam = searchParams.get("type");
  const tabParam = searchParams.get("tab");
  const accountCategory: "internal" | "external" =
    tabParam === "external" || typeParam === "external"
      ? "external"
      : "internal";

  // Sub-tab: "individual" | "bulk"
  const activeTab: "individual" | "bulk" = tabParam === "bulk" ? "bulk" : "individual";

  const handleCategoryChange = (cat: "internal" | "external") => {
    if (cat === accountCategory) return;
    const newParams = new URLSearchParams(searchParams);
    if (cat === "internal") {
      newParams.delete("type");
    } else {
      newParams.set("type", cat);
    }
    setSearchParams(newParams);
  };

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

  const handleSuccess = () => {
    navigate("/faculty-management");
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Header & Navigation */}
      <AddUserHeader
        accountCategory={accountCategory}
        activeTab={activeTab}
        onCategoryChange={handleCategoryChange}
        onTabChange={handleTabChange}
      />

      {/* EXTERNAL: TAB 1 (Individual) */}
      {accountCategory === "external" && activeTab === "individual" && (
        <AddExternalUserTab onSuccess={handleSuccess} />
      )}

      {/* EXTERNAL: TAB 2 (Bulk) */}
      {accountCategory === "external" && activeTab === "bulk" && (
        <AddBulkUserTab accountCategory="external" />
      )}

      {/* INTERNAL: TAB 1 (Individual) */}
      {accountCategory === "internal" && activeTab === "individual" && (
        <AddIndividualUserTab onSuccess={handleSuccess} />
      )}

      {/* INTERNAL: TAB 2 (Bulk) */}
      {accountCategory === "internal" && activeTab === "bulk" && (
        <AddBulkUserTab accountCategory="internal" />
      )}
    </div>
  );
}

export const AddFacultyMember = AddUser;
