import { useState, useMemo } from "react";
import { Lock, KeyRound, CheckCircle2, Shield, Eye, EyeOff, Key, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface SecurityPasswordTabProps {
  isSaving: boolean;
  onUpdatePassword: (newPassword: string, confirmPassword: string) => Promise<boolean>;
}

export function SecurityPasswordTab({
  isSaving,
  onUpdatePassword,
}: SecurityPasswordTabProps) {
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    if (passwordStrength === 0) return { text: "Too Short", color: "text-muted-foreground", barColor: "bg-muted" };
    if (passwordStrength <= 25) return { text: "Weak", color: "text-rose-500", barColor: "bg-rose-500" };
    if (passwordStrength <= 50) return { text: "Fair", color: "text-amber-500", barColor: "bg-amber-500" };
    if (passwordStrength <= 75) return { text: "Good", color: "text-indigo-500", barColor: "bg-indigo-500" };
    return { text: "Strong", color: "text-emerald-500", barColor: "bg-emerald-500" };
  }, [passwordStrength]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onUpdatePassword(newPassword, confirmPassword);
    if (success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start animate-in fade-in duration-200">
      {/* LEFT COLUMN (Col span 8): Password Form */}
      <div className="xl:col-span-8 flex flex-col gap-4">
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
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ensure your internal administrative account is protected with a strong, distinct password.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Current Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound size={12} className="text-primary" /> Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your existing password"
                    className="w-full h-10 px-3.5 pr-10 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* New Password & Strength */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Lock size={12} className="text-primary" /> New Password <span className="text-primary">*</span>
                  </label>
                  {newPassword && (
                    <span className={`text-[11px] font-bold ${passwordStrengthLabel.color}`}>
                      {passwordStrengthLabel.text}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters with mixed characters"
                    className="w-full h-10 px-3.5 pr-10 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Visual Password Strength Bar */}
                {newPassword && (
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrengthLabel.barColor}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-primary" /> Confirm New Password <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password to verify"
                    className={`w-full h-10 px-3.5 pr-10 bg-background border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all font-medium ${
                      confirmPassword && confirmPassword !== newPassword
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-border focus:border-primary"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <span className="text-[10.5px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle size={12} /> Passwords do not match.
                  </span>
                )}
              </div>

              {/* Submit Action */}
              <div className="flex items-center justify-between pt-3.5 border-t border-border mt-1">
                <span className="text-[11px] text-muted-foreground">
                  You will remain logged in on this browser after updating.
                </span>
                <Button
                  type="submit"
                  disabled={isSaving || (!!confirmPassword && confirmPassword !== newPassword)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Key size={14} />
                  {isSaving ? "Updating Password..." : "Update Security Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN (Col span 4): Password Policy Guidelines */}
      <div className="xl:col-span-4 flex flex-col gap-4">
        <Card className="bg-card border border-border rounded-2xl p-5 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Shield size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Password Standards
              </h3>
              <p className="text-[11px] text-muted-foreground">
                BoardQuest Administrative Policy
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Must be at least 6 characters in length (10+ recommended).</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Include upper &amp; lower case letters and numerical digits.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Never share or store credentials in unencrypted spreadsheets.</span>
            </div>
          </div>

          <div className="p-3 bg-muted/40 rounded-xl border border-border text-[11px] text-muted-foreground leading-relaxed mt-1">
            Password changes take effect immediately across all active internal review centers and API endpoints.
          </div>
        </Card>
      </div>
    </div>
  );
}
