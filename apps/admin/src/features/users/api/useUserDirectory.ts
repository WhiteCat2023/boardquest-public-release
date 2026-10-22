import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { RoleType } from "@/features/users/types/types";
import { getManagedRolesForFilter } from "@/features/users/utils/userUtils";
import { useUsers } from "@/features/users/api/useUsers";
import useRoleFlags from "@/hooks/useRoleFlags";

const ITEMS_PER_PAGE = 10;

export function useUserDirectory() {
  const { currentUser, userRole } = useRoleFlags();
  const currentUserRole = userRole as RoleType;
  const currentUserId = currentUser?.id;

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || searchParams.get("type");
  const initialTab: "internal" | "external" =
    tabParam === "external" ? "external" : "internal";
  const [activeTab, setActiveTab] = useState<"internal" | "external">(initialTab);
  const isExternalTab = activeTab === "external";

  const roleFilterOptions = getManagedRolesForFilter(currentUserRole);
  const showRoleFilter = !isExternalTab && roleFilterOptions.length > 0;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Backend Cursor Pagination State
  const [pageSize, setPageSize] = useState<number>(ITEMS_PER_PAGE);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [cursorsStack, setCursorsStack] = useState<(string | null)[]>([null]);
  const currentCursor = cursorsStack[currentPageIndex] || null;

  const resetPaginationOnFilterChange = () => {
    setCurrentPageIndex(0);
    setCursorsStack([null]);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPageIndex(0);
    setCursorsStack([null]);
  };

  const handleTabChange = (tab: "internal" | "external") => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("type", tab);
      return next;
    });
    setSelectedRole("ALL");
    resetPaginationOnFilterChange();
  };

  // Active query for current tab and filters
  const { data: userResponse, isLoading: isUsersLoading } = useUsers({
    search: searchTerm,
    role: isExternalTab ? "EXTERNAL" : (showRoleFilter ? selectedRole : "ALL"),
    status: selectedStatus,
    cursor: currentCursor || undefined,
    limit: pageSize,
    excludeExternal: !isExternalTab,
  });

  // Count queries for tab badges
  const { data: internalCountData } = useUsers({
    excludeExternal: true,
    limit: 1,
  });

  const { data: externalCountData } = useUsers({
    role: "EXTERNAL",
    limit: 1,
  });

  const internalCount = internalCountData?.total ?? 0;
  const externalCount = externalCountData?.total ?? 0;

  const isDean =
    currentUserRole === "DEAN" ||
    String(currentUserRole).toUpperCase().trim() === "DEAN";

  const rawUsers = userResponse?.users || userResponse?.faculties || [];
  const users = isDean
    ? rawUsers.filter((u) => {
        const r = String(u.role || "").toUpperCase().trim();
        return r === "TEACHER" || r === "TEAMLEAD" || isExternalTab;
      })
    : rawUsers;
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
    // Tab state
    activeTab,
    setActiveTab: handleTabChange,
    isExternalTab,
    internalCount,
    externalCount,
    // Search & Filter state
    searchTerm,
    setSearchTerm,
    selectedRole,
    setSelectedRole,
    selectedStatus,
    setSelectedStatus,
    showRoleFilter,
    resetFilters,
    resetPaginationOnFilterChange,
    // Data & Pagination
    users,
    totalUsers: userResponse?.total ?? users.length,
    pageSize,
    setPageSize: handlePageSizeChange,
    isUsersLoading,
    currentPageIndex,
    hasNextPage,
    cursorsStack,
    handleNext,
    handlePrevious,
    handlePageSelect,
  };
}
