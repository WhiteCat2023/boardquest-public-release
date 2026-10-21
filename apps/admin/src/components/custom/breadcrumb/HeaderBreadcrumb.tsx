import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useUsers } from "@/features/users";
import { useQuestionDetail } from "@/features/question-bank";
import useAuth from "@/hooks/useAuth";
import { Home } from "lucide-react";

const formatSegment = (segment: string) => {
  if (segment.toLowerCase() === "question-bank") {
    return "All Questions";
  }
  if (segment.toLowerCase() === "analytics") {
    return "Performance";
  }
  if (segment.toLowerCase() === "shared-library") {
    return "All Questions";
  }
  if (segment.toLowerCase() === "export-pdf") {
    return "Export to PDF";
  }
  if (segment.toLowerCase() === "faculty-management") {
    return "Users";
  }
  if (segment.toLowerCase() === "review-center-management") {
    return "Review Center";
  }
  if (segment.toLowerCase() === "subject-management") {
    return "Subject";
  }
  if (segment.toLowerCase() === "student-management") {
    return "Students";
  }
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function HeaderBreadcrumb() {
  const location = useLocation();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const currentUserRole = auth?.data?.user?.role || auth?.user?.role;

  const pathSegments = location.pathname.split("/").filter(Boolean);

  const isFacultyView =
    pathSegments[0] === "faculty-management" && pathSegments[1] === "view";
  const isQuestionViewOrEdit =
    pathSegments[0] === "question-bank" &&
    (pathSegments[1] === "view" || pathSegments[1] === "edit");
  const isSubjectView =
    pathSegments[0] === "subject-management" && pathSegments.length >= 2;
  const isReviewCenterView =
    (pathSegments[0] === "review-center" ||
      pathSegments[0] === "review-center-management") &&
    pathSegments.length >= 2 &&
    pathSegments[1] !== "create" &&
    pathSegments[1] !== "import";
  const isStudentView =
    pathSegments[0] === "student-management" &&
    pathSegments.length >= 2 &&
    pathSegments[1] !== "create" &&
    pathSegments[1] !== "import" &&
    pathSegments[1] !== "export-pdf";

  const questionId =
    isQuestionViewOrEdit && pathSegments[2] ? pathSegments[2] : null;

  const subjectCategoryId = isSubjectView
    ? pathSegments[1] === "view"
      ? pathSegments[2]
      : pathSegments[1]
    : null;

  const reviewCenterId = isReviewCenterView ? pathSegments[1] : null;
  const studentId = isStudentView ? pathSegments[1] : null;

  // User Directory Data
  const { data: userResponse } = useUsers();
  const users = userResponse?.users || userResponse?.faculties || [];

  // Question Detail Hook
  const { data: questionData } = useQuestionDetail(questionId);

  // Subject Category Detail Hook
  const { data: categoryData } = useQuery({
    queryKey: ["categoryDetail", subjectCategoryId],
    queryFn: async () => {
      if (!subjectCategoryId) return null;
      const response = await axiosPrivate.get(
        `/questions/category/single/${subjectCategoryId}`,
      );
      return response.data?.data?.category ?? response.data?.category ?? null;
    },
    enabled: !!subjectCategoryId,
    staleTime: 1000 * 60 * 5,
  });

  // Review Center Detail Hook
  const { data: reviewCenterData } = useQuery({
    queryKey: ["reviewCenterBreadcrumb", reviewCenterId],
    queryFn: async () => {
      if (!reviewCenterId) return null;
      const response = await axiosPrivate.get(
        `/review-center/${reviewCenterId}`,
      );
      return (
        response.data?.data?.reviewCenter ??
        response.data?.reviewCenter ??
        null
      );
    },
    enabled: !!reviewCenterId,
    staleTime: 1000 * 60 * 5,
  });

  // Student Detail Hook
  const { data: studentData } = useQuery({
    queryKey: ["studentBreadcrumb", studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const response = await axiosPrivate.get(`/students/get/${studentId}`);
      return response.data?.data?.student ?? response.data?.data ?? null;
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  });

  const filteredSegments = pathSegments.filter((seg, index) => {
    // Skip 'view' segment for question-bank, faculty-management, and subject-management
    if (
      (pathSegments[0] === "question-bank" ||
        pathSegments[0] === "faculty-management" ||
        pathSegments[0] === "subject-management") &&
      seg === "view" &&
      index === 1
    ) {
      return false;
    }
    // Skip 'shared-library' or 'bank' when under 'question-bank' to avoid duplicate 'All Questions > All Questions'
    if (
      pathSegments[0] === "question-bank" &&
      (seg === "shared-library" || seg === "bank") &&
      index === 1
    ) {
      return false;
    }
    // Omit 'question-bank' prefix for peer top-level pages (review-questions, my-questions, encoding-tracker)
    if (
      pathSegments[0] === "question-bank" &&
      index === 0 &&
      (pathSegments[1] === "review-questions" ||
        pathSegments[1] === "review" ||
        pathSegments[1] === "encoding-tracker" ||
        pathSegments[1] === "tracker" ||
        pathSegments[1] === "my-questions")
    ) {
      return false;
    }
    return true;
  });

  return (
    <Breadcrumb className="text-xs">
      <BreadcrumbList className="text-xs gap-1 sm:gap-1.5">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="p-0.5 rounded hover:text-foreground">
              <Home size={14} />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {filteredSegments.length > 0 && <BreadcrumbSeparator />}
        {filteredSegments.map((segment, index) => {
          const originalIndex = pathSegments.indexOf(segment);
          const url = `/${pathSegments.slice(0, originalIndex + 1).join("/")}`;
          const isLast = index === filteredSegments.length - 1;

          let displayLabel = formatSegment(segment);

          // Customize User View breadcrumb label
          if (isFacultyView && originalIndex === 2) {
            const userMember = users.find((f) => f.id === segment);
            if (userMember) {
              displayLabel = userMember.name;
            }
          }

          // Customize Question View/Edit breadcrumb label
          if (isQuestionViewOrEdit && originalIndex === 2 && questionData) {
            const rawText =
              questionData.text || (questionData as any).question || "";
            const truncatedText =
              rawText.length > 40 ? `${rawText.slice(0, 40)}...` : rawText;
            displayLabel =
              truncatedText || `Q-${segment.slice(-6).toUpperCase()}`;
          }

          // Customize Subject View breadcrumb label
          if (
            isSubjectView &&
            segment === subjectCategoryId &&
            categoryData?.name
          ) {
            displayLabel = categoryData.name;
          }

          // Customize Review Center View breadcrumb label
          if (
            isReviewCenterView &&
            segment === reviewCenterId &&
            reviewCenterData
          ) {
            displayLabel =
              reviewCenterData.companyName || reviewCenterData.name || segment;
          }

          // Customize Student View breadcrumb label
          if (isStudentView && segment === studentId && studentData) {
            displayLabel =
              studentData.name ||
              `${studentData.firstName || ""} ${studentData.lastName || ""}`.trim() ||
              studentData.email ||
              segment;
          }

          return (
            <Fragment key={url}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{displayLabel}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={url}>{displayLabel}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
