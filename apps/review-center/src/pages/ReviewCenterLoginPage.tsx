import { useState } from "react";
import { useReviewCenterAuth } from "../hooks/useReviewCenterAuth";
import { Mail, Lock, Eye, EyeOff, Building2, ShieldCheck, Loader2, UserX, ShieldAlert } from "lucide-react";

export function ReviewCenterLoginPage() {
  const { login, isLoading, isError, errorMessage } = useReviewCenterAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDeactivatedDialogOpen, setIsDeactivatedDialogOpen] = useState(false);
  const [deactivatedMsg, setDeactivatedMsg] = useState(
    "Your partner account is currently deactivated. Please contact your system administrator or Dean for assistance."
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login({ email, password });
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

  const handleAutofillDemo = () => {
    setEmail("rep@reviewcenter.edu.ph");
    setPassword("password123");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-sans p-4">
      <div className="w-full max-w-[420px] bg-card border border-border rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col items-center">
        {/* Logo Section matching Admin design */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative flex items-center justify-center h-16 w-24 mb-1">
            <span className="text-6xl font-black text-foreground absolute left-2 z-10 font-sans tracking-tighter">
              B
            </span>
            <span className="text-6xl font-black text-primary absolute right-1 z-20 top-2 font-sans tracking-tighter">
              Q
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-widest text-foreground">
            BOARDQUEST
          </h1>
          <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
            <Building2 className="w-3 h-3" /> Review Center Portal
          </div>
        </div>

        {/* Form Section matching Admin design */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="text-center mb-6">
            <h2 className="text-lg font-extrabold text-foreground mb-1">
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
                <input
                  type="text"
                  required
                  placeholder="rep@reviewcenter.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl text-sm transition-colors placeholder:text-muted-foreground text-foreground pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
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
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl text-sm transition-colors placeholder:text-muted-foreground text-foreground pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 cursor-pointer shadow-xs font-semibold py-2.5 text-sm flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                </>
              ) : (
                "Login to Partner Portal"
              )}
            </button>
          </div>

          {/* Error Message */}
          {(isError || localError) && !isDeactivatedDialogOpen && (
            <div className="mt-4 text-xs font-bold text-destructive text-center">
              {localError || errorMessage || "Login failed"}
            </div>
          )}
        </form>

        {/* Demo Credentials Footer Helper */}
        <div className="mt-8 text-center w-full pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleAutofillDemo}
            className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wide inline-flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> AUTO-FILL DEMO CREDENTIALS
          </button>
          <p className="text-[10px] font-medium text-muted-foreground mt-1">
            Default Demo: <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">rep@reviewcenter.edu.ph</code>
          </p>
        </div>
      </div>

      {/* Account Deactivated Modal Dialog */}
      {isDeactivatedDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-card rounded-3xl p-6 border border-border shadow-2xl max-w-md w-full text-foreground font-sans animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shrink-0 mt-0.5">
                <UserX size={24} className="stroke-[2.5]" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-bold text-foreground">
                  Account Deactivated
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your partner account is currently <strong className="text-destructive font-bold">deactivated</strong>. You cannot access the Review Center Portal while your account status is inactive.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/80 text-xs text-muted-foreground flex items-start gap-2.5 my-3">
              <ShieldAlert
                size={18}
                className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
              />
              <p className="leading-relaxed">
                {deactivatedMsg.includes("administrator")
                  ? deactivatedMsg
                  : "Please contact your system administrator or Dean to restore access to your account."}
              </p>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setIsDeactivatedDialogOpen(false)}
                className="w-full rounded-xl text-xs font-semibold h-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewCenterLoginPage;
