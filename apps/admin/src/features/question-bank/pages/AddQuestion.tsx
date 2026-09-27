import React, { useState } from "react";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import {
  AddQuestionHeader,
  IndividualQuestionForm,
  BulkImportQuestionsTab,
} from "../components/form";

export default function AddQuestion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { questionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const isEditMode = !!questionId;

  // Active Tab: "individual" | "bulk"
  const initialTab =
    searchParams.get("tab") === "bulk" || location.pathname.includes("/import")
      ? "bulk"
      : "individual";
  const [activeTab, setActiveTab] = useState<"individual" | "bulk">(initialTab);

  const handleTabChange = (tab: "individual" | "bulk") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : location.state?.from || null;

  const handleBackNav = () => {
    if (from) {
      navigate(from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/question-bank");
    }
  };

  return (
    <div
      className={`flex flex-col gap-3.5 p-4 md:p-5 w-full ${
        activeTab === "bulk" ? "max-w-7xl" : "max-w-4xl"
      } mx-auto font-sans bg-background text-foreground animate-in fade-in duration-300`}
    >
      {/* Header & Back Navigation with Segmented Pill Tabs */}
      <AddQuestionHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isEditMode={isEditMode}
        onBack={handleBackNav}
      />

      {/* Tab Content */}
      {activeTab === "individual" ? (
        <IndividualQuestionForm
          questionId={questionId}
          isEditMode={isEditMode}
          onSuccessNavigate={handleBackNav}
          onCancel={handleBackNav}
        />
      ) : (
        <BulkImportQuestionsTab />
      )}
    </div>
  );
}
