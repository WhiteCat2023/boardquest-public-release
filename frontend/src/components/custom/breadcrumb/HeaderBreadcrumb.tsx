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

const formatSegment = (segment: string) => {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function HeaderBreadcrumb() {
  const location = useLocation();
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

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Faculty Portal</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.length > 0 && <BreadcrumbSeparator />}
        {pathSegments.map((segment, index) => {
          const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1;

          let displayLabel = formatSegment(segment);

          // Customize Faculty View breadcrumb label
          if (isFacultyView && index === 2) {
            const facultyMember = faculties.find((f) => f.id === segment);
            if (facultyMember) {
              displayLabel = facultyMember.name;
            }
          }

          // Customize Question View/Edit breadcrumb label
          if (isQuestionViewOrEdit && index === 2 && questionData) {
            const rawText = questionData.question || "";
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
