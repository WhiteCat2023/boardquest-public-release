import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit3, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ParsedUserRow } from "@/features/users";
import {
  type EditParsedUserDialogProps,
  useEditParsedUserForm,
  InternalUserFormFields,
  ExternalUserFormFields,
} from "./edit-parsed-user";

export type { EditParsedUserDialogProps };

export default function EditParsedUserDialog({
  isOpen,
  onClose,
  row,
  rowIndex,
  accountCategory = "internal",
  onSave,
}: EditParsedUserDialogProps) {
  const isExternal = accountCategory === "external";

  const {
    firstName,
    setFirstName,
    middleName,
    setMiddleName,
    lastName,
    setLastName,
    employeeId,
    setEmployeeId,
    email,
    setEmail,
    phoneNumber,
    setPhoneNumber,
    role,
    setRole,
    companyName,
    setCompanyName,
    location,
    setLocation,
    validationError,
    handleSave,
  } = useEditParsedUserForm({
    isOpen,
    row,
    rowIndex,
    isExternal,
    onSave,
    onClose,
  });

  if (!row || rowIndex === null) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-2xl p-6 border border-border shadow-2xl max-w-lg flex flex-col font-sans text-foreground">
        <DialogHeader className="text-left pb-2 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isExternal
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                  : "bg-primary/10 text-primary border-primary/20"
              }`}
            >
              <Edit3 size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Edit Extracted Entry #{rowIndex + 1}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Update account details before completing bulk import.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          {validationError && (
            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{validationError}</span>
            </div>
          )}

          {isExternal ? (
            <ExternalUserFormFields
              companyName={companyName}
              onCompanyNameChange={setCompanyName}
              firstName={firstName}
              onFirstNameChange={setFirstName}
              lastName={lastName}
              onLastNameChange={setLastName}
              employeeId={employeeId}
              onEmployeeIdChange={setEmployeeId}
              location={location}
              onLocationChange={setLocation}
              email={email}
              onEmailChange={setEmail}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
            />
          ) : (
            <InternalUserFormFields
              firstName={firstName}
              onFirstNameChange={setFirstName}
              middleName={middleName}
              onMiddleNameChange={setMiddleName}
              lastName={lastName}
              onLastNameChange={setLastName}
              employeeId={employeeId}
              onEmployeeIdChange={setEmployeeId}
              role={role}
              onRoleChange={setRole}
              email={email}
              onEmailChange={setEmail}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
            />
          )}

          <DialogFooter className="flex items-center justify-between pt-3 border-t border-border/70 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs rounded-xl border-border hover:bg-accent font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`text-xs rounded-xl font-semibold px-4 shadow-xs ${
                isExternal
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              <CheckCircle2 size={13} className="mr-1" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
