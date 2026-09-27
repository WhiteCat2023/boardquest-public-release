import React, { useState, useMemo } from "react";
import {
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface PasswordFormProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isSaving: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PasswordForm({
  currentPassword,
  newPassword,
  confirmPassword,
  isSaving,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: PasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength score (0 - 100)
  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 6) score += 25;
    if (newPassword.length >= 10) score += 25;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 25;
    if (/[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) score += 25;
    return score;
  }, [newPassword]);

  const passwordStrengthLabel = useMemo(() => {
    if (passwordStrength === 0)
      return { text: "Too Short", color: "text-muted-foreground", barColor: "bg-muted" };
    if (passwordStrength <= 25)
      return { text: "Weak", color: "text-rose-500", barColor: "bg-rose-500" };
    if (passwordStrength <= 50)
      return { text: "Fair", color: "text-amber-500", barColor: "bg-amber-500" };
    if (passwordStrength <= 75)
      return { text: "Good", color: "text-indigo-500", barColor: "bg-indigo-500" };
    return { text: "Strong", color: "text-emerald-500", barColor: "bg-emerald-500" };
  }, [passwordStrength]);

  const isMismatch = Boolean(confirmPassword && confirmPassword !== newPassword);

  return (
    <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col">
      <CardHeader className="border-b border-border pb-4 pt-5 px-5 sm:px-6 bg-card">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Lock size={15} />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Update Account Password
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Ensure your partner portal access is secured with a distinct, robust credential.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {/* Current Password */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="current-password"
              className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
            >
              <KeyRound size={12} className="text-primary" /> Current Password{" "}
              <span className="text-primary">*</span>
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => onCurrentPasswordChange(e.target.value)}
                placeholder="Enter your existing password"
                className="h-10 px-3.5 pr-10 rounded-xl text-xs sm:text-sm font-medium"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </Button>
            </div>
          </div>

          {/* New Password & Strength */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="new-password"
                className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
              >
                <Lock size={12} className="text-primary" /> New Password{" "}
                <span className="text-primary">*</span>
              </Label>
              {newPassword && (
                <span className={`text-[11px] font-bold ${passwordStrengthLabel.color}`}>
                  {passwordStrengthLabel.text}
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                placeholder="Minimum 6 characters with mixed characters"
                className="h-10 px-3.5 pr-10 rounded-xl text-xs sm:text-sm font-medium"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </Button>
            </div>

            {/* Visual Password Strength Bar */}
            {newPassword && (
              <Progress
                value={passwordStrength}
                className="h-1.5 mt-1"
                indicatorClassName={passwordStrengthLabel.barColor}
              />
            )}
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="confirm-password"
              className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
            >
              <CheckCircle2 size={12} className="text-primary" /> Confirm New Password{" "}
              <span className="text-primary">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                placeholder="Re-enter your new password to verify"
                className={`h-10 px-3.5 pr-10 rounded-xl text-xs sm:text-sm font-medium ${
                  isMismatch
                    ? "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20"
                    : ""
                }`}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </Button>
            </div>
            {isMismatch && (
              <span className="text-[10.5px] font-bold text-rose-500 flex items-center gap-1">
                <AlertCircle size={12} /> Passwords do not match.
              </span>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-border mt-1">
            <span className="text-[11px] text-muted-foreground">
              You will remain logged in on this browser after updating.
            </span>
            <Button
              type="submit"
              disabled={isSaving || isMismatch}
              className="h-10 px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Key size={14} />
                  <span>Update Security Password</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
