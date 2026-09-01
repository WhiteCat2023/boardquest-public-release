import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rcAxios } from "@/lib/axios";
import { toast } from "sonner";

export function ReviewCenterResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!token) {
      toast.error("Invalid or missing password reset token.");
      return;
    }

    if (newPassword.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = "Passwords do not match.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      await rcAxios.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      setIsSuccess(true);
      toast.success("Password reset successful!");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to reset password. The link may have expired.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-sans p-4 select-none relative overflow-hidden">
      {/* Subtle ambient maroon top and bottom decorative glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[540px] h-[540px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[420px] h-[420px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px] bg-card border border-border/80 rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative flex items-center justify-center h-16 w-24 mb-1">
            <span className="text-6xl font-black text-foreground absolute left-2 z-10 font-sans tracking-tighter">
              B
            </span>
            <span className="text-6xl font-black text-primary absolute right-1 z-20 top-2 font-sans tracking-tighter drop-shadow-xs">
              Q
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-widest text-foreground">
            BOARDQUEST
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-0.5 rounded-full border border-primary/20 shadow-2xs">
            <Building2 className="w-3 h-3 text-primary" /> Review Center Portal
          </div>
        </div>

        {/* Missing / Invalid Token State */}
        {!token ? (
          <div className="flex flex-col items-center text-center space-y-4 w-full animate-in fade-in duration-300">
            <div className="size-14 bg-destructive/10 rounded-full flex items-center justify-center text-destructive border border-destructive/20">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-lg font-extrabold text-foreground tracking-tight">
              INVALID <span className="text-primary">RESET LINK</span>
            </h2>
            <p className="text-xs font-medium text-muted-foreground max-w-[280px] leading-relaxed">
              This password reset link is invalid or has expired. Please request a new link.
            </p>

            <Button
              onClick={() => navigate("/forgot-password")}
              className="w-full mt-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold uppercase tracking-wider text-xs h-11 cursor-pointer shadow-xs"
            >
              REQUEST NEW LINK
            </Button>

            <div className="mt-4 text-center w-full">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline uppercase tracking-wide transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> BACK TO LOG IN
              </Link>
            </div>
          </div>
        ) : isSuccess ? (
          /* Success State */
          <div className="flex flex-col items-center text-center space-y-4 w-full animate-in fade-in duration-300">
            <div className="size-14 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-lg font-extrabold text-foreground tracking-tight">
              PASSWORD <span className="text-primary">RESET SUCCESSFUL</span>
            </h2>
            <p className="text-xs font-medium text-muted-foreground max-w-[280px] leading-relaxed">
              Your password has been reset successfully. You can now log in to the Review Center portal.
            </p>

            <Button
              onClick={() => navigate("/login")}
              className="w-full mt-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold uppercase tracking-wider text-xs h-11 cursor-pointer shadow-xs"
            >
              PROCEED TO LOG IN
            </Button>
          </div>
        ) : (
          /* Reset Form */
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-lg font-extrabold text-foreground mb-1 tracking-tight">
                SET NEW <span className="text-primary">PASSWORD</span>
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide max-w-[280px] mx-auto leading-snug">
                ENTER YOUR NEW PASSWORD TO RESTORE ACCESS
              </p>
            </div>

            <div className="space-y-4">
              {/* New Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="new-password"
                  className="text-[11px] font-bold text-foreground uppercase tracking-wide block"
                >
                  NEW PASSWORD
                </label>
                <div className="relative flex items-center">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewPassword(e.target.value)
                    }
                    className="pl-10 pr-10 h-11"
                    autoFocus
                  />
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="text-[11px] font-bold text-foreground uppercase tracking-wide block"
                >
                  CONFIRM NEW PASSWORD
                </label>
                <div className="relative flex items-center">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="pl-10 pr-10 h-11"
                  />
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold rounded-xl text-center">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full h-11 text-xs uppercase tracking-wider font-extrabold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all cursor-pointer disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>RESETTING PASSWORD...</span>
                </>
              ) : (
                "UPDATE PASSWORD"
              )}
            </Button>

            {/* Back to Login */}
            <div className="mt-6 text-center w-full">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline uppercase tracking-wide transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> BACK TO LOG IN
              </Link>
            </div>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Authorized Access Only. Powered by{" "}
            <strong className="text-foreground">BoardQuest Evaluation Engine</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReviewCenterResetPasswordPage;
