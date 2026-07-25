import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { Power, Search, RotateCcw, X } from "lucide-react";
import type { RoleType } from "./types";
import { getAllowedRolesToCreate } from "./utils/facultyUtils";
import { useFaculties, useToggleFacultyStatus, useDepartments } from "./hooks/useFaculty";
import FacultyHeader from "./components/FacultyHeader";
import FacultyTable from "./components/FacultyTable";
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

export default function FacultyManagement() {
  const { auth } = useAuth();

  const currentUserRole = (auth as any)?.data?.user?.role as RoleType;
  const currentUserId = (auth as any)?.data?.user?.id;

  const { data: faculties = [], isLoading: isFacultiesLoading } = useFaculties();
  const { data: departments = [] } = useDepartments();
  const toggleStatusMutation = useToggleFacultyStatus();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

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

  const handleOpenToggleConfirm = (id: string, currentStatus: boolean, name: string) => {
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
      { id: memberId, isActive: nextStatus },
      {
        onSuccess: () => {
          toast.success(`${memberName}'s account was ${nextStatus ? "activated" : "deactivated"}.`);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to update account status.");
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
      }
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRole("ALL");
    setSelectedDept("ALL");
    setSelectedStatus("ALL");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedRole !== "ALL" ||
    selectedDept !== "ALL" ||
    selectedStatus !== "ALL";

  // Filtering Logic
  const filteredFaculties = faculties.filter((f) => {
    const matchSearch =
      !searchTerm.trim() ||
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.employeeId && f.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.username && f.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchRole = selectedRole === "ALL" || f.role === selectedRole;
    
    const matchDept =
      selectedDept === "ALL" ||
      f.departmentId === selectedDept ||
      f.department?.name.toLowerCase() === selectedDept.toLowerCase();

    const isActive = f.isActive !== false;

    const matchStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "ACTIVE" && isActive) ||
      (selectedStatus === "DEACTIVATED" && !isActive);

    return matchSearch && matchRole && matchDept && matchStatus;
  });

  const canAddFaculty = getAllowedRolesToCreate(currentUserRole).length > 0;
  const isTogglingActive = confirmDialog.currentStatus !== false;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 w-full min-h-full font-sans bg-background text-foreground">
      <FacultyHeader canAddFaculty={canAddFaculty} />

      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            type="text"
            placeholder="Search by name, email, employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-9 h-10 bg-muted/40 border border-border rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground placeholder:text-muted-foreground"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="h-10 w-[140px] bg-muted/40 border-border rounded-xl text-xs font-semibold text-foreground">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="TEAMLEAD">Team Lead</SelectItem>
              <SelectItem value="TEACHER">Teacher</SelectItem>
            </SelectContent>
          </Select>

          {/* Department Filter */}
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="h-10 w-[160px] bg-muted/40 border-border rounded-xl text-xs font-semibold text-foreground">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-10 w-[130px] bg-muted/40 border-border rounded-xl text-xs font-semibold text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-10 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl gap-1.5 cursor-pointer px-3"
            >
              <RotateCcw size={13} />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Directory Table */}
      <FacultyTable
        faculties={filteredFaculties}
        isLoading={isFacultiesLoading}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
        onToggleStatus={handleOpenToggleConfirm}
      />

      {/* Shadcn UI Confirmation AlertDialog */}
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Power className={isTogglingActive ? "text-amber-500" : "text-emerald-500"} size={20} />
              {isTogglingActive ? "Deactivate Account" : "Activate Account"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Are you sure you want to {isTogglingActive ? "deactivate" : "activate"}{" "}
              <strong className="text-foreground">{confirmDialog.memberName}</strong>'s account?{" "}
              {isTogglingActive
                ? "Deactivated accounts will immediately lose login privileges."
                : "Active accounts will regain full login access."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 py-2 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={`rounded-xl text-white text-xs font-semibold px-4 py-2 cursor-pointer ${
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
