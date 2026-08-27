import { useState } from "react";
import { toast } from "sonner";
import { Power, Search, RotateCcw, X } from "lucide-react";
import type { RoleType } from "@/features/users";
import { getAllowedRolesToCreate } from "@/features/users/utils/userUtils";
import {
  useUsers,
  useToggleUserStatus,
} from "@/features/users";
import UserHeader from "../components/UserHeader";
import UserTable from "../components/UserTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import QuestionListPagination from "@/components/custom/pagination/QuestionListPagination";
import useRoleFlags from "@/hooks/useRoleFlags";

const ITEMS_PER_PAGE = 10;

export default function UserManagement() {
  const { currentUser, userRole } = useRoleFlags();
  const currentUserRole = userRole as RoleType;
  const currentUserId = currentUser?.id;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Backend Cursor Pagination State (matching Question Bank)
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [cursorsStack, setCursorsStack] = useState<(string | null)[]>([null]);
  const currentCursor = cursorsStack[currentPageIndex] || null;

  const { data: userResponse, isLoading: isUsersLoading } = useUsers(
    {
      search: searchTerm,
      role: selectedRole,
      status: selectedStatus,
      cursor: currentCursor || undefined,
      limit: ITEMS_PER_PAGE,
    },
  );

  const users = userResponse?.users || userResponse?.faculties || [];
  const nextCursor = userResponse?.nextCursor || null;
  const hasNextPage = userResponse?.hasNextPage || false;

  const toggleStatusMutation = useToggleUserStatus();

  const resetPaginationOnFilterChange = () => {
    setCurrentPageIndex(0);
    setCursorsStack([null]);
  };

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

  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    memberId: string;
    memberName: string;
    currentStatus?: boolean;
  }>({
    isOpen: false,
    memberId: "",
    memberName: "",
  });

  const handleOpenToggleConfirm = (
    id: string,
    currentStatus: boolean,
    name: string,
  ) => {
    if (id === currentUserId) {
      toast.error("You cannot change your own account status.");
      return;
    }
    setConfirmDialog({
      isOpen: true,
      memberId: id,
      memberName: name,
      currentStatus,
    });
  };

  const handleConfirmAction = () => {
    const { memberId, memberName, currentStatus } = confirmDialog;
    if (!memberId) return;

    const nextStatus = !currentStatus;
    toggleStatusMutation.mutate(
      {
        id: memberId,
        accountStatus: nextStatus ? "ACTIVE" : "DEACTIVATED",
        isActive: nextStatus,
      },
      {
        onSuccess: () => {
          toast.success(
            `${memberName}'s account was ${nextStatus ? "activated" : "deactivated"}.`,
          );
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to update account status.",
          );
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
      },
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRole("ALL");
    setSelectedStatus("ALL");
    resetPaginationOnFilterChange();
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedRole !== "ALL" ||
    selectedStatus !== "ALL";

  const canAddUser = getAllowedRolesToCreate(currentUserRole).length > 0;
  const isTogglingActive = confirmDialog.currentStatus !== false;

  return (
    <div className="flex flex-col gap-3.5 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground">
      <UserHeader canAddUser={canAddUser} />

      {/* Search & Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card border border-border p-2.5 px-3 rounded-xl shadow-2xs w-full">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
          <Input
            type="text"
            placeholder="Search by name, email, employee ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetPaginationOnFilterChange();
            }}
            className="pl-9 pr-8 h-8.5 bg-muted/30 hover:bg-muted/50 border border-border rounded-lg text-xs focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground placeholder:text-muted-foreground transition-colors w-full"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                resetPaginationOnFilterChange();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-full hover:bg-muted"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Role Filter */}
          <Select
            value={selectedRole}
            onValueChange={(v) => {
              setSelectedRole(v);
              resetPaginationOnFilterChange();
            }}
          >
            <SelectTrigger className="h-8.5 w-full sm:w-[125px] flex-1 sm:flex-initial bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
              <SelectItem value="DEAN">Dean</SelectItem>
              <SelectItem value="TEAMLEAD">Team Lead</SelectItem>
              <SelectItem value="TEACHER">Teacher</SelectItem>
              <SelectItem value="REVIEWCENTER">Review Center</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={(v) => {
              setSelectedStatus(v);
              resetPaginationOnFilterChange();
            }}
          >
            <SelectTrigger className="h-8.5 w-full sm:w-[130px] flex-1 sm:flex-initial bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active Accounts</SelectItem>
              <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8.5 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg gap-1 cursor-pointer px-2.5"
            >
              <RotateCcw size={12} />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Directory Table — Backend Paginated Response */}
      <UserTable
        users={users}
        isLoading={isUsersLoading}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId || ""}
        onToggleStatus={handleOpenToggleConfirm}
      />

      {/* Backend Cursor Pagination Bar (Matching Question Bank) */}
      {!isUsersLoading && (
        <QuestionListPagination
          currentPage={currentPageIndex + 1}
          hasNextPage={!!hasNextPage}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onPageSelect={handlePageSelect}
          maxPageReached={cursorsStack.length}
        />
      )}

      {/* Confirmation AlertDialog */}
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <AlertDialogContent className="bg-card rounded-2xl p-5 border border-border shadow-xl max-w-md text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Power
                className={
                  isTogglingActive ? "text-amber-500" : "text-emerald-500"
                }
                size={18}
              />
              {isTogglingActive ? "Deactivate Account" : "Activate Account"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Are you sure you want to{" "}
              {isTogglingActive ? "deactivate" : "activate"}{" "}
              <strong className="text-foreground">
                {confirmDialog.memberName}
              </strong>
              's account?{" "}
              {isTogglingActive
                ? "Deactivated accounts will immediately lose login privileges."
                : "Active accounts will regain full login access."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex items-center justify-end gap-2">
            <AlertDialogCancel className="rounded-lg bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-3.5 py-1.5 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={`rounded-lg text-white text-xs font-semibold px-3.5 py-1.5 cursor-pointer ${
                isTogglingActive
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {`Confirm ${isTogglingActive ? "Deactivation" : "Activation"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const FacultyManagement = UserManagement;
