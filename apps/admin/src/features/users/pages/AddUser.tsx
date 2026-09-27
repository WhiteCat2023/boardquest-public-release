import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddUserHeader from "../components/AddUserHeader";
import AddIndividualUserTab from "../components/AddIndividualUserTab";
import AddBulkUserTab from "../components/AddBulkUserTab";
import AddExternalUserTab from "../components/AddExternalUserTab";
import UserCredentialsModal, {
  type UserCredentialsInfo,
} from "../components/UserCredentialsModal";

export default function AddUser() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Account Category: "internal" | "external"
  const typeParam = searchParams.get("type");
  const tabParam = searchParams.get("tab");
  const initialCategory =
    tabParam === "external" || typeParam === "external"
      ? "external"
      : "internal";
  const [accountCategory, setAccountCategory] = useState<
    "internal" | "external"
  >(initialCategory);

  // Sub-tab: "individual" | "bulk"
  const initialTab = tabParam === "bulk" ? "bulk" : "individual";
  const [activeTab, setActiveTab] = useState<"individual" | "bulk">(initialTab);

  const [createdCredentials, setCreatedCredentials] =
    useState<UserCredentialsInfo | null>(null);

  const handleCategoryChange = (cat: "internal" | "external") => {
    setAccountCategory(cat);
    setSearchParams({ type: cat, tab: activeTab });
  };

  const handleTabChange = (tab: "individual" | "bulk") => {
    setActiveTab(tab);
    setSearchParams({ type: accountCategory, tab });
  };

  const handleCredentialsSuccess = (credentials: UserCredentialsInfo) => {
    setCreatedCredentials(credentials);
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
        <AddExternalUserTab onSuccess={handleCredentialsSuccess} />
      )}

      {/* EXTERNAL: TAB 2 (Bulk) */}
      {accountCategory === "external" && activeTab === "bulk" && (
        <AddBulkUserTab accountCategory="external" />
      )}

      {/* INTERNAL: TAB 1 (Individual) */}
      {accountCategory === "internal" && activeTab === "individual" && (
        <AddIndividualUserTab onSuccess={handleCredentialsSuccess} />
      )}

      {/* INTERNAL: TAB 2 (Bulk) */}
      {accountCategory === "internal" && activeTab === "bulk" && (
        <AddBulkUserTab accountCategory="internal" />
      )}

      {/* Account Created & Credentials Modal */}
      <UserCredentialsModal
        isOpen={!!createdCredentials}
        onClose={() => {
          setCreatedCredentials(null);
          navigate("/faculty-management");
        }}
        credentials={createdCredentials}
      />
    </div>
  );
}

export const AddFacultyMember = AddUser;
