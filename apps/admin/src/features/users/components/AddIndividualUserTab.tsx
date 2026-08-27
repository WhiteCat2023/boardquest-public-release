import React from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CreateUserPayload, RoleOption } from "@/features/users";
import UserProfileForm from "./UserProfileForm";

interface AddIndividualUserTabProps {
  errorMsg: string;
  formData: CreateUserPayload;
  firstName: string;
  middleName: string;
  lastName: string;
  allowedRoles: RoleOption[];
  isPending: boolean;
  onFirstNameChange: (val: string) => void;
  onMiddleNameChange: (val: string) => void;
  onLastNameChange: (val: string) => void;
  onFieldChange: (field: keyof CreateUserPayload, value: any) => void;
  onCategoryChange: (categoryIds: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function AddIndividualUserTab({
  errorMsg,
  formData,
  firstName,
  middleName,
  lastName,
  allowedRoles,
  isPending,
  onFirstNameChange,
  onMiddleNameChange,
  onLastNameChange,
  onFieldChange,
  onCategoryChange,
  onSubmit,
  onCancel,
}: AddIndividualUserTabProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
        onFirstNameChange={onFirstNameChange}
        onMiddleNameChange={onMiddleNameChange}
        onLastNameChange={onLastNameChange}
        onChange={onFieldChange}
        onCategoryChange={onCategoryChange}
      />

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="cursor-pointer border-border hover:bg-accent text-foreground font-semibold px-4 py-2 rounded-lg h-9 text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-semibold px-6 py-2 rounded-lg h-9 text-xs shadow-xs transition-all flex items-center gap-1.5"
        >
          {isPending ? (
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
