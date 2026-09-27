import { useState } from "react";
import { useReviewCenters } from "./useReviewCenter";


export function useReviewCenterDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [selectedCompany, setSelectedCompany] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const { data: rawReviewCenters = [], isLoading: isCentersLoading } = useReviewCenters({
    search: searchTerm,
    location: selectedLocation,
    company: selectedCompany,
  });

  const reviewCenters = Array.isArray(rawReviewCenters) ? rawReviewCenters : [];
  const total = reviewCenters.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const hasNextPage = currentPage < totalPages;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReviewCenters = reviewCenters.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const uniqueLocations = Array.from(
    new Set(reviewCenters.map((rc) => rc?.location || "Philippines").filter(Boolean))
  );

  const uniqueCompanies = Array.from(
    new Set(reviewCenters.map((rc) => rc?.companyName).filter((name): name is string => Boolean(name)))
  );

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLocation("ALL");
    setSelectedCompany("ALL");
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleLocationChange = (val: string) => {
    setSelectedLocation(val);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (hasNextPage) setCurrentPage((p) => p + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handlePageSelect = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedLocation !== "ALL" ||
    selectedCompany !== "ALL";

  return {
    searchTerm,
    handleSearchChange,
    selectedLocation,
    handleLocationChange,
    selectedCompany,
    setSelectedCompany,
    currentPage,
    setCurrentPage,
    totalPages,
    hasNextPage,
    handleNextPage,
    handlePreviousPage,
    handlePageSelect,
    paginatedReviewCenters,
    uniqueLocations,
    uniqueCompanies,
    isCentersLoading,
    resetFilters,
    hasActiveFilters,
  };
}

export default useReviewCenterDirectory;

