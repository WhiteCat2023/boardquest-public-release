import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import useRoleFlags from "@/hooks/useRoleFlags";
import { useReviewCenter, useReviewCenterCandidates } from "../api/useReviewCenter";
import { useCalendar } from "../api/useCalendar";
import ReviewCenterHeader from "../components/details/ReviewCenterHeader";
import ReviewCenterOverviewTab from "../components/details/ReviewCenterOverviewTab";
import ReviewCenterStudentsTab from "../components/details/ReviewCenterStudentsTab";
import ReviewCenterSchedulesTab from "../components/details/ReviewCenterSchedulesTab";
import ReviewCenterAssessmentsTab from "../components/details/ReviewCenterAssessmentsTab";
import AddEditReviewCenterModal from "../components/AddEditReviewCenterModal";

export function ReviewCenterDetailsPage() {
  const { reviewCenterId } = useParams<{ reviewCenterId: string }>();
  const navigate = useNavigate();
  const { isAdminOrSuperAdmin, isTeamLead } = useRoleFlags();
  const canManage = isAdminOrSuperAdmin || isTeamLead;

  const [activeTab, setActiveTab] = useState<"overview" | "students" | "schedules" | "assessments">("overview");

  // Fetch Review Center Data
  const { data: reviewCenter, isLoading: isCenterLoading } = useReviewCenter(reviewCenterId);

  // Fetch Enrolled Candidates for this review center
  const { data: candidatesData } = useReviewCenterCandidates(reviewCenterId);
  const studentsCount = candidatesData?.candidates?.length ?? candidatesData?.total ?? 0;

  // Fetch Schedules count for this review center
  const { data: schedules = [] } = useCalendar({
    company: reviewCenter?.companyName,
  });
  const schedulesCount = schedules.length;

  // Edit Review Center Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full max-w-5xl mx-auto min-h-full font-sans bg-background text-foreground animate-in fade-in duration-200">
      {/* Top Header & Navigation Bar */}
      <ReviewCenterHeader
        reviewCenter={reviewCenter}
        isLoading={isCenterLoading}
        canManage={canManage}
        activeTab={activeTab}
        studentsCount={studentsCount}
        schedulesCount={schedulesCount}
        onTabChange={setActiveTab}
        onOpenEdit={() => setIsEditOpen(true)}
        onBackNav={() => navigate("/review-center")}
      />

      {/* Main Tab Content Area */}
      {isCenterLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : activeTab === "overview" ? (
        <ReviewCenterOverviewTab
          reviewCenter={reviewCenter}
          studentsCount={studentsCount}
          schedulesCount={schedulesCount}
          formatDate={formatDate}
          onNavigateStudentsTab={() => setActiveTab("students")}
          onNavigateSchedulesTab={() => setActiveTab("schedules")}
        />
      ) : activeTab === "students" ? (
        <ReviewCenterStudentsTab reviewCenter={reviewCenter} />
      ) : activeTab === "assessments" ? (
        <ReviewCenterAssessmentsTab reviewCenter={reviewCenter} />
      ) : (
        <ReviewCenterSchedulesTab reviewCenter={reviewCenter} />
      )}

      {/* Edit Review Center Modal */}
      {isEditOpen && reviewCenter && (
        <AddEditReviewCenterModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          initialData={reviewCenter}
        />
      )}
    </div>
  );
}

export default ReviewCenterDetailsPage;
