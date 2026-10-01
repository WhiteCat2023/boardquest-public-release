import { useState, useMemo } from "react";
import {
  useReviewCenterCandidates,
  type ReviewCenterCandidateItem,
} from "../../api/useReviewCenter";
import ReviewCenterCandidateScoreModal from "./ReviewCenterCandidateScoreModal";
import { DataTablePagination } from "@/components/custom/pagination";
import {
  type ReviewCenterStudentsTabProps,
  ReviewCenterStudentsFilterToolbar,
  ReviewCenterStudentsTable,
} from "./students-tab";

export type { ReviewCenterStudentsTabProps };

export default function ReviewCenterStudentsTab({
  reviewCenter,
}: ReviewCenterStudentsTabProps) {
  const [selectedCandidateForScores, setSelectedCandidateForScores] =
    useState<ReviewCenterCandidateItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>("ALL");
  const [selectedGameStatus, setSelectedGameStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data, isLoading } = useReviewCenterCandidates(reviewCenter?.id, {
    search: searchTerm,
    schoolYear: selectedSchoolYear !== "ALL" ? selectedSchoolYear : undefined,
  });

  const candidatesList = data?.candidates || [];
  const schoolYears = data?.schoolYears || [];

  // Filter candidates by game status if selected
  const filteredCandidates = useMemo(() => {
    return candidatesList.filter((c) => {
      if (selectedGameStatus === "REGISTERED") {
        return Boolean(c.studentId || c.studentDetails);
      }
      if (selectedGameStatus === "UNREGISTERED") {
        return !c.studentId && !c.studentDetails;
      }
      return true;
    });
  }, [candidatesList, selectedGameStatus]);

  const total = filteredCandidates.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const hasNextPage = currentPage < totalPages;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCandidates = filteredCandidates.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleNext = () => {
    if (hasNextPage) setCurrentPage((p) => p + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handlePageSelect = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSchoolYear("ALL");
    setSelectedGameStatus("ALL");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedSchoolYear !== "ALL" ||
    selectedGameStatus !== "ALL";

  return (
    <div className="space-y-4 animate-in fade-in duration-200 font-sans">
      {/* ── Search & Filter Controls Toolbar ── */}
      <ReviewCenterStudentsFilterToolbar
        searchTerm={searchTerm}
        onSearchTermChange={(term) => {
          setSearchTerm(term);
          setCurrentPage(1);
        }}
        selectedSchoolYear={selectedSchoolYear}
        onSchoolYearChange={(sy) => {
          setSelectedSchoolYear(sy);
          setCurrentPage(1);
        }}
        schoolYears={schoolYears}
        selectedGameStatus={selectedGameStatus}
        onGameStatusChange={(status) => {
          setSelectedGameStatus(status);
          setCurrentPage(1);
        }}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ── Candidates Table with Integrated Footer ── */}
      <ReviewCenterStudentsTable
        candidates={paginatedCandidates}
        isLoading={isLoading}
        searchTerm={searchTerm}
        companyName={reviewCenter?.companyName}
        onSelectCandidateForScores={setSelectedCandidateForScores}
        pagination={
          !isLoading && (
            <DataTablePagination
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={currentPage > 1}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onPageSelect={handlePageSelect}
              totalPages={totalPages}
              totalItems={total}
              pageSize={ITEMS_PER_PAGE}
              itemLabel="candidates"
              variant="table-footer"
            />
          )
        }
      />

      {/* ── Candidate Score Transcript Modal ── */}
      <ReviewCenterCandidateScoreModal
        open={Boolean(selectedCandidateForScores)}
        onOpenChange={(open) => !open && setSelectedCandidateForScores(null)}
        candidateId={selectedCandidateForScores?.id || null}
        candidateName={selectedCandidateForScores?.name}
        candidateSchoolId={selectedCandidateForScores?.schoolId || null}
        reviewCenterId={reviewCenter?.id}
      />
    </div>
  );
}
