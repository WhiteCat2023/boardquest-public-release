import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/question";
import type { RoleType, CreateUserPayload } from "@/features/users/types/types";
import { getAllowedRolesToCreate } from "@/features/users/utils/userUtils";
import { useCreateUser } from "@/features/users/api/useUsers";
import useRoleFlags from "@/hooks/useRoleFlags";
import type { UserCredentialsInfo } from "./UserCredentialsModal";
import UserProfileForm from "./UserProfileForm";

interface AddIndividualUserTabProps {
  onSuccess: (credentials: UserCredentialsInfo) => void;
  onCancel?: () => void;
}

export default function AddIndividualUserTab({
  onSuccess,
  onCancel,
}: AddIndividualUserTabProps) {
  const navigate = useNavigate();
  const { userRole } = useRoleFlags();
  const currentUserRole = userRole as RoleType;

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formData, setFormData] = useState<CreateUserPayload>({
    employeeId: "",
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: UserRole.TEACHER as RoleType,
  });
  const [errorMsg, setErrorMsg] = useState("");

  const createMutation = useCreateUser();

  useEffect(() => {
    const r = String(currentUserRole || "").toUpperCase();
    if (r === "SUPERADMIN" || currentUserRole === UserRole.SUPERADMIN) {
      setFormData((prev) => ({ ...prev, role: UserRole.DEAN }));
    } else if (r === "DEAN" || currentUserRole === UserRole.DEAN) {
      setFormData((prev) => ({ ...prev, role: UserRole.TEAMLEAD }));
    } else {
      setFormData((prev) => ({ ...prev, role: UserRole.TEACHER }));
    }
  }, [currentUserRole]);

  const allowedRoles = getAllowedRolesToCreate(currentUserRole);

  const handleFieldChange = (field: keyof CreateUserPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (categoryIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      handledCategoryIds: categoryIds,
      handledSubjectIds: categoryIds,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("Please enter both First Name and Last Name.");
      return;
    }

    const fullName = [firstName.trim(), middleName.trim(), lastName.trim()]
      .filter(Boolean)
      .join(" ");

    const payload: CreateUserPayload = {
      ...formData,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: fullName,
    };

    createMutation.mutate(payload, {
      onSuccess: (res: any) => {
        const createdUser = res?.data?.data?.user || res?.data?.user;
        const tempPass = createdUser?.temporaryPassword;
        const credentials: UserCredentialsInfo = {
          name: createdUser?.name || payload.name,
          email: createdUser?.email || payload.email,
          employeeId: createdUser?.employeeId || payload.employeeId,
          role: String(payload.role || "TEACHER"),
          temporaryPassword: tempPass,
          portalUrl: `${window.location.origin}/login`,
        };
        toast.success("User registered successfully!");
        onSuccess(credentials);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || "Failed to register user.";
        setErrorMsg(msg);
        toast.error(msg);
      },
    });
  };

  const handleCancel = onCancel || (() => navigate("/faculty-management"));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {errorMsg && (
        <div className="flex items-center gap-2.5 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-semibold animate-in fade-in duration-150">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Compact Profile Form */}
      <UserProfileForm
        formData={formData}
        firstName={firstName}
        middleName={middleName}
        lastName={lastName}
        allowedRoles={allowedRoles}
        onFirstNameChange={setFirstName}
        onMiddleNameChange={setMiddleName}
        onLastNameChange={setLastName}
        onChange={handleFieldChange}
        onCategoryChange={handleCategoryChange}
      />

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={createMutation.isPending}
          className="cursor-pointer border-border hover:bg-accent text-foreground font-semibold px-4 py-2 rounded-lg h-9 text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-semibold px-6 py-2 rounded-lg h-9 text-xs shadow-xs transition-all flex items-center gap-1.5"
        >
          {createMutation.isPending ? (
            <span className="inline-block animate-spin border-2 border-primary-foreground border-t-transparent rounded-full w-3.5 h-3.5" />
          ) : (
            <Sparkles size={14} />
          )}
          Register User Account
        </Button>
      </div>
    </form>
  );
}

export const AddIndividualFacultyTab = AddIndividualUserTab;
