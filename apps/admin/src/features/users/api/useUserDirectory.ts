import { useState } from "react";
import type { RoleType } from "@/features/users/types/types";
import { getManagedRolesForFilter } from "@/features/users/utils/userUtils";
import { useUsers } from "@/features/users/api/useUsers";
import useRoleFlags from "@/hooks/useRoleFlags";

const ITEMS_PER_PAGE = 10;

export function useUserDirectory() {
  const { currentUser, userRole } = useRoleFlags();
  const currentUserRole = userRole as RoleType;
  const currentUserId = currentUser?.id;

  const roleFilterOptions = getManagedRolesForFilter(currentUserRole);
  const showRoleFilter = roleFilterOptions.length > 0;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Backend Cursor Pagination State
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [cursorsStack, setCursorsStack] = useState<(string | null)[]>([null]);
  const currentCursor = cursorsStack[currentPageIndex] || null;

  const resetPaginationOnFilterChange = () => {
    setCurrentPageIndex(0);
    setCursorsStack([null]);
  };

  const { data: userResponse, isLoading: isUsersLoading } = useUsers({
    search: searchTerm,
    role: showRoleFilter ? selectedRole : "ALL",
    status: selectedStatus,
    cursor: currentCursor || undefined,
    limit: ITEMS_PER_PAGE,
  });

  const users = userResponse?.users || userResponse?.faculties || [];
  const nextCursor = userResponse?.nextCursor || null;
  const hasNextPage = userResponse?.hasNextPage || false;

  const handleNext = () => {
    if (hasNextPage && nextCursor) {
      if (currentPageIndex === cursorsStack.length - 1) {
        setCursorsStack((prev) => [...prev, nextCursor]);
      }
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const handlePageSelect = (pageNumber: number) => {
    const targetIdx = pageNumber - 1;
    if (targetIdx >= 0 && targetIdx < cursorsStack.length) {
      setCurrentPageIndex(targetIdx);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRole("ALL");
    setSelectedStatus("ALL");
    resetPaginationOnFilterChange();
  };

  return {
    currentUserRole,
    currentUserId,
    // Search & Filter state
    searchTerm,
    setSearchTerm,
    selectedRole,
    setSelectedRole,
    selectedStatus,
    setSelectedStatus,
    resetFilters,
    resetPaginationOnFilterChange,
    // Data & Pagination
    users,
    totalUsers: userResponse?.total ?? users.length,
    pageSize: ITEMS_PER_PAGE,
    isUsersLoading,
    currentPageIndex,
    hasNextPage,
    cursorsStack,
    handleNext,
    handlePrevious,
    handlePageSelect,
  };
}
