import type { ReviewCenterCandidateItem } from "../../../api/useReviewCenter";
import type { ReviewCenterRepresentative } from "../../../types/types";

export interface ReviewCenterStudentsTabProps {
  reviewCenter: ReviewCenterRepresentative | null | undefined;
}

export function formatEnrolledDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}
