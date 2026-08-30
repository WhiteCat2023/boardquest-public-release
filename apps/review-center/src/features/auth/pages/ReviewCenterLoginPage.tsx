import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";
import { Mail, Lock, Eye, EyeOff, Building2, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReviewCenterLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";
  const { user, login, isLoading } = useReviewCenterAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDeactivatedDialogOpen, setIsDeactivatedDialogOpen] = useState(false);
  const [deactivatedMsg, setDeactivatedMsg] = useState(
    "Your partner account is currently deactivated. Please contact your system administrator or Dean for assistance."
  );

  useEffect(() => {
    if (user && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      const status = errorObj?.response?.status;
      const message =
        errorObj?.response?.data?.message ||
        (err instanceof Error ? err.message : "") ||
        "";
      if (status === 403 || message.toLowerCase().includes("deactivated")) {
        if (message) setDeactivatedMsg(message);
        setIsDeactivatedDialogOpen(true);
      } else {
        setLocalError(message || "Failed to sign in. Please verify your credentials.");
      }
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="text-center mb-6">
            <h2 className="text-lg font-extrabold text-foreground mb-1 tracking-tight">
              REVIEW CENTER <span className="text-primary">LOG IN</span>
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide max-w-[260px] mx-auto leading-snug">
              ENTER YOUR REPRESENTATIVE CREDENTIALS TO CONTINUE
            </p>
          </div>

          <div className="space-y-4">
            {/* Email / ID Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wide block">
                EMAIL ADDRESS / EMPLOYEE ID
              </label>
              <div className="relative flex items-center">
                <Input
                  type="text"
                  required
                  placeholder="rep@reviewcenter.edu.ph"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="pl-10"
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wide block">
                PASSWORD
              </label>
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {localError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold rounded-xl text-center">
              {localError}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 text-xs uppercase tracking-wider font-extrabold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              "SIGN IN TO PORTAL"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Authorized Access Only. Powered by{" "}
            <strong className="text-foreground">BoardQuest Evaluation Engine</strong>.
          </p>
        </div>
      </div>

      {/* Account Deactivated Modal Dialog */}
      {isDeactivatedDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-150">
          <div className="bg-card border border-destructive/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20">
              <ShieldAlert className="size-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-foreground">
                Account Deactivated
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {deactivatedMsg}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeactivatedDialogOpen(false)}
              className="w-full"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewCenterLoginPage;
