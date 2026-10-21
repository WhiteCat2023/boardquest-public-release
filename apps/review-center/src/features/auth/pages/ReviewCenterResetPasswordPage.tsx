import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeClosed,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import boardQuestLogo from "@/assets/boardquest.png";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { rcAxios } from "@/lib/axios";
import { toast } from "sonner";

export function ReviewCenterResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(Boolean(token));
  const [tokenError, setTokenError] = useState<string | null>(
    !token
      ? "This password reset link is invalid or missing a token. Please request a new reset email."
      : null,
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);
  const [toggleConfirmPassword, setToggleConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validate the reset token as soon as the page is accessed
  useEffect(() => {
    if (!token) {
      setIsVerifyingToken(false);
      setTokenError(
        "This password reset link is invalid or missing a token. Please request a new reset email.",
      );
      return;
    }

    let isMounted = true;
    setIsVerifyingToken(true);
    setTokenError(null);

    rcAxios
      .get("/auth/verify-reset-token", {
        params: { token },
      })
      .then(() => {
        if (isMounted) {
          setIsVerifyingToken(false);
          setTokenError(null);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          const message =
            err.response?.data?.message ||
            "This password reset link is invalid, has expired (5-minute limit), or has already been used.";
          setTokenError(message);
          setIsVerifyingToken(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

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
        "Failed to reset password. The link may have expired or was already used.";
      setErrorMsg(msg);
      toast.error(msg);
      if (
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("invalid")
      ) {
        setTokenError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-sans p-4">
      <div className="w-full max-w-[420px] bg-card border border-border rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col items-center">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={boardQuestLogo}
            alt="BoardQuest Logo"
            className="h-16 sm:h-20 w-auto object-contain mb-1"
          />
        </div>

        {/* 1. Verifying Token State */}
        {isVerifyingToken ? (
          <div className="flex flex-col items-center text-center space-y-4 py-8 animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Loader2 className="size-7 animate-spin" />
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
              Verifying <span className="text-primary">Reset Link</span>
            </h2>
            <p className="text-xs font-medium text-muted-foreground max-w-[280px] leading-relaxed">
              Validating your security link. Please wait a moment...
            </p>
          </div>
        ) : tokenError ? (
          /* 2. Token Error State (Missing, Expired > 5m, or Already Used) */
          <div className="flex flex-col items-center text-center space-y-4 w-full animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center text-destructive border border-destructive/20">
              <AlertTriangle size={30} />
            </div>
            <h2 className="text-lg font-extrabold text-foreground tracking-tight">
              LINK EXPIRED OR <span className="text-destructive">INVALID</span>
            </h2>
            <p className="text-xs font-semibold text-muted-foreground max-w-[300px] leading-relaxed">
              {tokenError}
            </p>

            <div className="w-full space-y-2.5 pt-2">
              <Button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="w-full bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold uppercase tracking-wider text-xs py-3.5 cursor-pointer shadow-xs"
              >
                REQUEST NEW LINK
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full rounded-xl font-bold uppercase tracking-wider text-xs py-3.5 cursor-pointer"
              >
                BACK TO LOG IN
              </Button>
            </div>
          </div>
        ) : isSuccess ? (
          /* 3. Password Successfully Reset State */
          <div className="flex flex-col items-center text-center space-y-4 w-full animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-lg font-extrabold text-foreground">
              PASSWORD <span className="text-primary">RESET SUCCESSFUL</span>
            </h2>
            <p className="text-xs font-bold text-muted-foreground max-w-[280px] leading-relaxed">
              Your password has been updated successfully. You can now log in to the Review Center portal.
            </p>

            <Button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full mt-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold uppercase tracking-wider text-xs py-3.5 cursor-pointer shadow-xs"
            >
              PROCEED TO LOG IN
            </Button>
          </div>
        ) : (
          /* 4. Active Reset Password Form */
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <FieldGroup>
              <FieldSet className="text-center mb-8">
                <FieldLegend className="text-lg font-extrabold text-foreground mb-1">
                  SET NEW <span className="text-primary">PASSWORD</span>
                </FieldLegend>
                <FieldDescription className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wide max-w-[260px] mx-auto leading-snug">
                  ENTER YOUR NEW PASSWORD TO RESTORE ACCESS
                </FieldDescription>

                <FieldGroup className="mt-6">
                  {/* New Password */}
                  <Field>
                    <FieldLabel
                      className="text-[11px] font-bold text-foreground uppercase tracking-wide text-left block"
                      htmlFor="new-password"
                    >
                      NEW PASSWORD
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <Lock className="size-4 text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="new-password"
                        type={togglePassword ? "text" : "password"}
                        required
                        placeholder="**********"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <InputGroupAddon align="inline-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setTogglePassword(!togglePassword)}
                          className="text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {togglePassword ? <Eye className="size-4" /> : <EyeClosed className="size-4" />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>

                  {/* Confirm Password */}
                  <Field>
                    <FieldLabel
                      className="text-[11px] font-bold text-foreground uppercase tracking-wide text-left block"
                      htmlFor="confirm-password"
                    >
                      CONFIRM PASSWORD
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <Lock className="size-4 text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="confirm-password"
                        type={toggleConfirmPassword ? "text" : "password"}
                        required
                        placeholder="**********"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <InputGroupAddon align="inline-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            setToggleConfirmPassword(!toggleConfirmPassword)
                          }
                          className="text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {toggleConfirmPassword ? <Eye className="size-4" /> : <EyeClosed className="size-4" />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>

                  {errorMsg && (
                    <div className="text-xs font-bold text-destructive text-center">
                      {errorMsg}
                    </div>
                  )}

                  <Button
                    className="w-full bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold uppercase tracking-wider text-xs py-3.5 transition-all mt-2 cursor-pointer shadow-xs"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "RESETTING..." : "RESET PASSWORD"}
                  </Button>

                  {/* Back to Login Footer */}
                  <div className="mt-8 text-center w-full">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline uppercase tracking-wide transition-colors"
                    >
                      <ArrowLeft size={14} /> BACK TO LOG IN
                    </Link>
                  </div>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </form>
        )}
      </div>
    </div>
  );
}

export default ReviewCenterResetPasswordPage;
