import { useState } from "react";
import { toast } from "sonner";
import { getAllowedRolesToCreate } from "@/features/users/utils/userUtils";
import { useUserDirectory } from "../api/useUserDirectory";
import UserHeader from "../components/UserHeader";
import UserTable from "../components/UserTable";
import UserSearchFiltersBar from "../components/UserSearchFiltersBar";
import ToggleUserStatusDialog, {
  type TargetMemberToToggle,
} from "../components/ToggleUserStatusDialog";
import { DataTablePagination } from "@/components/custom/pagination";

export default function UserManagement() {
  const {
    currentUserRole,
    currentUserId,
    searchTerm,
    setSearchTerm,
    selectedRole,
    setSelectedRole,
    selectedStatus,
    setSelectedStatus,
    resetFilters,
    resetPaginationOnFilterChange,
    users,
    totalUsers,
    pageSize,
    isUsersLoading,
    currentPageIndex,
    hasNextPage,
    cursorsStack,
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
      toast.error("You cannot change your own account status.");
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
      <UserHeader canAddUser={canAddUser} />

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
      />

      {/* Directory Table — Backend Paginated Response with Integrated Footer */}
      <UserTable
        users={users}
        isLoading={isUsersLoading}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId || ""}
        onToggleStatus={handleOpenToggleConfirm}
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
              itemLabel="users"
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
