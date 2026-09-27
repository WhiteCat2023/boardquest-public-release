import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useRoleFlags from "@/hooks/useRoleFlags";
import { useReviewCenter, useReviewCenterCandidates } from "../api/useReviewCenter";
import { useCalendar } from "../api/useCalendar";
import {
  ReviewCenterDetailsHeader,
  ReviewCenterTabsContent,
  AddEditReviewCenterModal,
} from "../components";

export function ReviewCenterDetailsPage() {
  const { reviewCenterId } = useParams<{ reviewCenterId: string }>();
  const navigate = useNavigate();
  const { isAdminOrSuperAdmin, isTeamLead } = useRoleFlags();
  const canManage = isAdminOrSuperAdmin || isTeamLead;

  const [activeTab, setActiveTab] = useState<"overview" | "students" | "schedules">("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Direct queries
  const { data: reviewCenter, isLoading: isCenterLoading } = useReviewCenter(reviewCenterId);
  const { data: candidatesData } = useReviewCenterCandidates(reviewCenterId);
  const { data: schedules = [] } = useCalendar({
    company: reviewCenter?.companyName,
  });

  const studentsCount = candidatesData?.candidates?.length ?? candidatesData?.total ?? 0;
  const schedulesCount = schedules.length;

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
      <ReviewCenterDetailsHeader
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
      <ReviewCenterTabsContent
        activeTab={activeTab}
        isLoading={isCenterLoading}
        reviewCenter={reviewCenter}
        studentsCount={studentsCount}
        schedulesCount={schedulesCount}
        formatDate={formatDate}
        onNavigateStudentsTab={() => setActiveTab("students")}
        onNavigateSchedulesTab={() => setActiveTab("schedules")}
      />

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
