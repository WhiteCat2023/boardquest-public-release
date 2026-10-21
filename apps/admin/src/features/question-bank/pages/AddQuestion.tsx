import { useState } from "react";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import {
  AddQuestionHeader,
  IndividualQuestionForm,
  BulkImportQuestionsTab,
} from "../components/form";
import useRoleFlags from "@/hooks/useRoleFlags";
import { useMyEncodingProgress } from "../api/useEncodingTracker";
import { CheckCircle2 } from "lucide-react";

export default function AddQuestion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { questionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isTeacher } = useRoleFlags();
  const { data: progress } = useMyEncodingProgress();

  const isEditMode = !!questionId;

  const isOverallQuotaMet =
    isTeacher &&
    Boolean(
      progress?.overall &&
        progress.overall.totalTarget > 0 &&
        progress.overall.remainingCount === 0,
    );

  // Active Tab: "individual" | "bulk"
  const tabParam = searchParams.get("tab");
  const activeTab: "individual" | "bulk" =
    tabParam === "bulk" || location.pathname.includes("/import")
      ? "bulk"
      : "individual";

  const handleTabChange = (tab: "individual" | "bulk") => {
    if (tab === activeTab) return;
    if (tab === "individual") {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("tab");
      setSearchParams(newParams);
    } else {
      setSearchParams({ tab: "bulk" });
    }
  };

  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : location.state?.from || null;

  const handleBackNav = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (from) {
      navigate(from);
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

      {/* Teacher Quota Completed Announcement */}
      {isTeacher && isOverallQuotaMet && !isEditMode && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 flex items-start gap-3 shadow-2xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span>Authoring Quota Completed</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                Goal Met
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              You have authored all required questions ({progress?.overall.totalEncoded} of {progress?.overall.totalTarget}) across your assigned subjects. You cannot add additional questions.
            </p>
          </div>
        </div>
      )}

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
