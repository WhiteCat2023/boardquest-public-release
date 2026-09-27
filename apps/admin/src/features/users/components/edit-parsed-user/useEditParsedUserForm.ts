import { useState, useEffect } from "react";
import type { ParsedUserRow } from "../../types/types";

interface UseEditParsedUserFormProps {
  isOpen: boolean;
  row: ParsedUserRow | null;
  rowIndex: number | null;
  isExternal: boolean;
  onSave: (index: number, updatedRow: ParsedUserRow) => void;
  onClose: () => void;
}

export function useEditParsedUserForm({
  isOpen,
  row,
  rowIndex,
  isExternal,
  onSave,
  onClose,
}: UseEditParsedUserFormProps) {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("TEACHER");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (row) {
      setFirstName(row.firstName || "");
      setMiddleName(row.middleName || "");
      setLastName(row.lastName || "");
      setEmployeeId(row.employeeId || "");
      setEmail(row.email || "");
      setPhoneNumber(row.phoneNumber || "");
      setRole(row.role ? String(row.role).toUpperCase() : "TEACHER");
      setCompanyName(row.companyName || "");
      setLocation(row.location || "Philippines");
      setValidationError("");
    }
  }, [row, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedFirst = firstName.trim();
    const trimmedMiddle = middleName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmpId = employeeId.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phoneNumber.trim();
    const trimmedCompany = companyName.trim();
    const trimmedLocation = location.trim() || "Philippines";

    const fullName = [trimmedFirst, trimmedMiddle, trimmedLast]
      .filter(Boolean)
      .join(" ")
      .trim();

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    let isValid = true;
    let errorMsg = "";

    if (isExternal) {
      if (!trimmedCompany) {
        isValid = false;
        errorMsg = "Missing Organization Name";
      } else if (!trimmedFirst && !trimmedLast && !fullName) {
        isValid = false;
        errorMsg = "Missing Representative Name";
      } else if (!trimmedEmpId) {
        isValid = false;
        errorMsg = "Missing Partner ID";
      } else if (!trimmedEmail || !isValidEmail) {
        isValid = false;
        errorMsg = "Invalid Email Address";
      } else if (!trimmedPhone) {
        isValid = false;
        errorMsg = "Missing Phone Number";
      }
    } else {
      if (!trimmedFirst && !trimmedLast && !fullName) {
        isValid = false;
        errorMsg = "Missing Name";
      } else if (!trimmedEmpId) {
        isValid = false;
        errorMsg = "Missing Employee ID";
      } else if (!trimmedEmail || !isValidEmail) {
        isValid = false;
        errorMsg = "Invalid Email Address";
      } else if (!trimmedPhone) {
        isValid = false;
        errorMsg = "Missing Phone Number";
      }
    }

    if (rowIndex === null) return;

    const updatedRow: ParsedUserRow = {
      name: fullName || `${trimmedFirst} ${trimmedLast}`.trim(),
      firstName: trimmedFirst || undefined,
      middleName: trimmedMiddle || undefined,
      lastName: trimmedLast || undefined,
      employeeId: trimmedEmpId || undefined,
      email: trimmedEmail,
      phoneNumber: trimmedPhone || undefined,
      role: isExternal ? "EXTERNAL" : role,
      companyName: isExternal ? trimmedCompany : undefined,
      location: isExternal ? trimmedLocation : undefined,
      isValid,
      validationError: errorMsg,
    };

    onSave(rowIndex, updatedRow);
    onClose();
  };

  return {
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
  };
}
