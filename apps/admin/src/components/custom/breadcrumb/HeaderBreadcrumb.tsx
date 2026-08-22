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
import { useFaculties } from "@/features/faculty";
import { useQuestionDetail } from "@/features/question-bank";
import useAuth from "@/hooks/useAuth";
import { Home } from "lucide-react";

const formatSegment = (segment: string) => {
  if (segment.toLowerCase() === "analytics") {
    return "Performance";
  }
  if (segment.toLowerCase() === "shared-library") {
    return "All Questions";
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

  const getPortalTitle = (role?: string) => {
    switch (role?.toUpperCase()) {
      case "SUPERADMIN":
        return "Super Admin Portal";
      case "DEAN":
        return "Dean Portal";
      case "TEAMLEAD":
        return "Team Lead Portal";
      case "TEACHER":
      default:
        return "Faculty Portal";
    }
  };

  const portalTitle = getPortalTitle(currentUserRole);

  const pathSegments = location.pathname.split("/").filter(Boolean);

  const isFacultyView =
    pathSegments[0] === "faculty-management" && pathSegments[1] === "view";
  const isQuestionViewOrEdit =
    pathSegments[0] === "question-bank" &&
    (pathSegments[1] === "view" || pathSegments[1] === "edit");
  const isSubjectView =
    pathSegments[0] === "subject-management" && pathSegments.length >= 2;

  const questionId =
    isQuestionViewOrEdit && pathSegments[2] ? pathSegments[2] : null;

  const subjectCategoryId = isSubjectView
    ? pathSegments[1] === "view"
      ? pathSegments[2]
      : pathSegments[1]
    : null;

  // Faculty Directory Data
  const { data: facultyResponse } = useFaculties();
  const faculties = facultyResponse?.faculties ?? [];

  // Question Detail Hook
  const { data: questionData } = useQuestionDetail(questionId);

  // Subject Category Detail Hook
  const { data: categoryData } = useQuery({
    queryKey: ["categoryDetail", subjectCategoryId],
    queryFn: async () => {
      if (!subjectCategoryId) return null;
      const response = await axiosPrivate.get(
        `/questions/category/single/${subjectCategoryId}`
      );
      return response.data?.data?.category ?? response.data?.category ?? null;
    },
    enabled: !!subjectCategoryId,
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
    return true;
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">
              <Home size={16} />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {filteredSegments.length > 0 && <BreadcrumbSeparator />}
        {filteredSegments.map((segment, index) => {
          const originalIndex = pathSegments.indexOf(segment);
          const url = `/${pathSegments.slice(0, originalIndex + 1).join("/")}`;
          const isLast = index === filteredSegments.length - 1;

          let displayLabel = formatSegment(segment);

          // Customize Faculty View breadcrumb label
          if (isFacultyView && originalIndex === 2) {
            const facultyMember = faculties.find((f) => f.id === segment);
            if (facultyMember) {
              displayLabel = facultyMember.name;
            }
          }

          // Customize Question View/Edit breadcrumb label
          if (isQuestionViewOrEdit && originalIndex === 2 && questionData) {
            const rawText = questionData.text || (questionData as any).question || "";
            const truncatedText =
              rawText.length > 40 ? `${rawText.slice(0, 40)}...` : rawText;
            displayLabel =
              truncatedText || `Q-${segment.slice(-6).toUpperCase()}`;
          }

          // Customize Subject View breadcrumb label
          if (isSubjectView && segment === subjectCategoryId && categoryData?.name) {
            displayLabel = categoryData.name;
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
