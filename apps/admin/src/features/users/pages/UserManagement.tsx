import { useState } from "react";
import { Shield, Building2 } from "lucide-react";
import { showFeedback } from "@/components/modal";
import { getAllowedRolesToCreate } from "@/features/users/utils/userUtils";
import { useUserDirectory } from "../api/useUserDirectory";
import UserHeader from "../components/UserHeader";
import UserTable from "../components/UserTable";
import UserSearchFiltersBar from "../components/UserSearchFiltersBar";
import ToggleUserStatusDialog, {
  type TargetMemberToToggle,
} from "../components/ToggleUserStatusDialog";
import { DataTablePagination } from "@/components/custom/pagination";
import { StandardNavTabs } from "@/components/custom/tabs";

export default function UserManagement() {
  const {
    currentUserRole,
    currentUserId,
    activeTab,
    setActiveTab,
    isExternalTab,
    internalCount,
    externalCount,
    searchTerm,
    setSearchTerm,
    selectedRole,
    setSelectedRole,
    selectedStatus,
    setSelectedStatus,
    showRoleFilter,
    resetFilters,
    resetPaginationOnFilterChange,
    users,
    totalUsers,
    pageSize,
    setPageSize,
    isUsersLoading,
    currentPageIndex,
    hasNextPage,
    handleNext,
    handlePrevious,
    handlePageSelect,
  } = useUserDirectory();

  const [targetMemberToToggle, setTargetMemberToToggle] =
    useState<TargetMemberToToggle | null>(null);

  const canAddUser = getAllowedRolesToCreate(currentUserRole).length > 0;

  const handleOpenToggleConfirm = (
    id: string,
    currentStatus: boolean,
    name: string,
    role?: string,
    email?: string,
  ) => {
    if (id === currentUserId) {
      showFeedback.error("You cannot change your own account status.");
      return;
    }
    setTargetMemberToToggle({
      id,
      name,
      currentStatus,
      role,
      email,
    });
  };

  return (
    <div className="flex flex-col gap-3.5 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground">
      <UserHeader canAddUser={canAddUser} activeTab={activeTab} />

      {/* Standardized Navigation Tabs: Internal Users vs External Users */}
      <StandardNavTabs
        tabs={[
          {
            id: "internal",
            label: "Internal Users",
            icon: Shield,
            badgeCount: internalCount,
          },
          {
            id: "external",
            label: "External Users",
            icon: Building2,
            badgeCount: externalCount,
          },
        ]}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as "internal" | "external")}
        rightContent={
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>
              Total {activeTab === "external" ? "External" : "Internal"} Users:
            </span>
            <span className="text-foreground font-bold">{totalUsers}</span>
          </div>
        }
      />

      {/* Search & Filters Bar */}
      <UserSearchFiltersBar
        currentUserRole={currentUserRole}
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          resetPaginationOnFilterChange();
        }}
        selectedRole={selectedRole}
        onRoleChange={(val) => {
          setSelectedRole(val);
          resetPaginationOnFilterChange();
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          resetPaginationOnFilterChange();
        }}
        onResetFilters={resetFilters}
        showRoleFilter={showRoleFilter}
        isExternalTab={isExternalTab}
      />

      {/* Directory Table — Backend Paginated Response with Integrated Footer */}
      <UserTable
        users={users}
        isLoading={isUsersLoading}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId || ""}
        onToggleStatus={handleOpenToggleConfirm}
        activeTab={activeTab}
        pagination={
          !isUsersLoading && (
            <DataTablePagination
              currentPage={currentPageIndex + 1}
              hasNextPage={!!hasNextPage}
              hasPreviousPage={currentPageIndex > 0}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onPageSelect={handlePageSelect}
              totalItems={totalUsers}
              pageSize={pageSize}
              pageSizeOptions={[10, 20, 30, 50]}
              onPageSizeChange={setPageSize}
              itemLabel={activeTab === "external" ? "external users" : "users"}
              variant="table-footer"
            />
          )
        }
      />

      {/* Account Status Confirmation Dialog */}
      <ToggleUserStatusDialog
        targetMember={targetMemberToToggle}
        onClose={() => setTargetMemberToToggle(null)}
      />
    </div>
  );
}

export const FacultyManagement = UserManagement;
