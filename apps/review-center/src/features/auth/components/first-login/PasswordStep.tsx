import React, { useState, useId } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  LogOut,
} from "lucide-react";

interface PasswordStepProps {
  isSuccess: boolean;
  errorMessage: string | null;
  isSubmitting: boolean;
  onSubmit: (password: string, confirmPassword: string) => Promise<void> | void;
  onBack: () => void;
  onLogout: () => void;
}

export const PasswordStep: React.FC<PasswordStepProps> = ({
  isSuccess,
  errorMessage,
  isSubmitting,
  onSubmit,
  onBack,
  onLogout,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const newPasswordId = useId();
  const confirmPasswordId = useId();

  // Password criteria verification
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const validCount = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  const isPasswordValid = validCount === 5 && passwordsMatch;
  const canSubmitPassword = isPasswordValid && !isSubmitting;

  const getStrengthLabel = () => {
    if (password.length === 0)
      return {
        label: "Not entered",
        color: "bg-muted text-muted-foreground",
        width: "0%",
      };
    if (validCount <= 2)
      return { label: "Weak", color: "bg-rose-500 text-rose-500", width: "25%" };
    if (validCount <= 4)
      return {
        label: "Moderate",
        color: "bg-amber-500 text-amber-500",
        width: "65%",
      };
    return {
      label: "Strong",
      color: "bg-emerald-500 text-emerald-500",
      width: "100%",
    };
  };

  const strength = getStrengthLabel();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitPassword) return;
    onSubmit(password, confirmPassword);
  };

  if (isSuccess) {
    return (
      <div className="p-6 sm:p-7 flex flex-col items-center justify-center text-center space-y-4 py-12 animate-in fade-in zoom-in-95 duration-200">
        <div className="size-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-9 stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">
            Password Successfully Updated!
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            Your representative account has been fully activated with your new secure credentials. Welcome to the Review Center Portal!
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-primary font-medium">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-7 flex flex-col space-y-5 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
          <KeyRound className="size-6 stroke-[2.2]" />
        </div>
        <div>
          <DialogHeader className="p-0 gap-0.5 text-left">
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              Change Temporary Password
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Security requirement: You must establish a secure permanent password for your partner account.
            </DialogDescription>
          </DialogHeader>
        </div>
      </div>

      {/* Encouragement / Security Notice Box */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-300 space-y-1.5 leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
          <span>First-Time Sign-In Requirement</span>
        </div>
        <p className="text-muted-foreground text-[11px]">
          You are currently signed in using a temporary login key issued by the university administrator. For institutional security and protection of candidate assessment records, you must set a permanent password.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/25 text-destructive flex items-start gap-2.5 text-xs animate-in fade-in duration-150">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Password Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 animate-in fade-in duration-150">
        <div className="space-y-1.5">
          <Label
            htmlFor={newPasswordId}
            className="text-xs font-semibold text-foreground"
          >
            New Permanent Password
          </Label>
          <div className="relative">
            <Input
              id={newPasswordId}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new secure password"
              className="text-xs pr-9 bg-background"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={confirmPasswordId}
            className="text-xs font-semibold text-foreground"
          >
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id={confirmPasswordId}
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="text-xs pr-9 bg-background"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Strength Indicator */}
        {password.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Strength:</span>
              <span className={`font-semibold ${strength.color}`}>
                {strength.label}
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  validCount <= 2
                    ? "bg-rose-500"
                    : validCount <= 4
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: strength.width }}
              />
            </div>
          </div>
        )}

        {/* Requirements */}
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1 text-[11px]">
          <div className="grid grid-cols-2 gap-1 text-muted-foreground">
            <div
              className={`flex items-center gap-1.5 ${
                hasMinLength
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : ""
              }`}
            >
              <Check
                className={`size-3 stroke-[3] ${
                  hasMinLength ? "opacity-100" : "opacity-30"
                }`}
              />
              <span>8+ characters</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                hasUppercase
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : ""
              }`}
            >
              <Check
                className={`size-3 stroke-[3] ${
                  hasUppercase ? "opacity-100" : "opacity-30"
                }`}
              />
              <span>Uppercase (A-Z)</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                hasLowercase
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : ""
              }`}
            >
              <Check
                className={`size-3 stroke-[3] ${
                  hasLowercase ? "opacity-100" : "opacity-30"
                }`}
              />
              <span>Lowercase (a-z)</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                hasNumber
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : ""
              }`}
            >
              <Check
                className={`size-3 stroke-[3] ${
                  hasNumber ? "opacity-100" : "opacity-30"
                }`}
              />
              <span>Number (0-9)</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                hasSpecial
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : ""
              }`}
            >
              <Check
                className={`size-3 stroke-[3] ${
                  hasSpecial ? "opacity-100" : "opacity-30"
                }`}
              />
              <span>Special symbol</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                passwordsMatch
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : ""
              }`}
            >
              <Check
                className={`size-3 stroke-[3] ${
                  passwordsMatch ? "opacity-100" : "opacity-30"
                }`}
              />
              <span>Passwords match</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="text-xs gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back</span>
          </Button>
          <Button
            type="submit"
            disabled={!canSubmitPassword}
            className="flex-1 text-xs font-semibold py-2.5 h-auto shadow-sm gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                <span>Save Password & Finish</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Bottom Actions */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={onLogout}
          className="text-xs text-muted-foreground hover:text-foreground h-8 gap-1.5"
        >
          <LogOut className="size-3.5" />
          <span>Log Out</span>
        </Button>
      </div>
    </div>
  );
};

export default PasswordStep;
