import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useFaculties } from "@/view/admin/faculty/hooks/useFaculty";
import { useQuestionDetail } from "@/hooks/useQuestionBank";
import useAuth from "@/hooks/useAuth";

const formatSegment = (segment: string) => {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function HeaderBreadcrumb() {
  const location = useLocation();
  const { auth } = useAuth();
  const currentUserRole = (auth as any)?.data?.user?.role || (auth as any)?.user?.role;

  const getPortalTitle = (role?: string) => {
    switch (role?.toUpperCase()) {
      case "SUPERADMIN":
        return "Super Admin Portal";
      case "ADMIN":
        return "Admin Portal";
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

  const questionId =
    isQuestionViewOrEdit && pathSegments[2] ? pathSegments[2] : null;

  // Faculty Directory Data
  const { data: faculties = [] } = useFaculties();

  // Question Detail Hook
  const { data: questionData } = useQuestionDetail(questionId);

  const filteredSegments = pathSegments.filter((seg, index) => {
    // Skip 'view' segment for question-bank and faculty-management
    if (
      (pathSegments[0] === "question-bank" || pathSegments[0] === "faculty-management") &&
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
            <Link to="/">{portalTitle}</Link>
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
