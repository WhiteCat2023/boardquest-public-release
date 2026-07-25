import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeClosed, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "../../components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../components/ui/input-group";
import { Button } from "../../components/ui/button";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);
  const [toggleConfirmPassword, setToggleConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing password reset token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axiosPrivate.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      setIsSuccess(true);
      toast.success("Password reset successful!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reset password. Link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-sans p-4">
      <div className="w-full max-w-[420px] bg-card border border-border rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col items-center">
        {/* Logo Section */}
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
        </div>

        {/* Missing / Invalid Token State */}
        {!token ? (
          <div className="flex flex-col items-center text-center space-y-4 w-full animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-lg font-extrabold text-foreground">
              INVALID <span className="text-primary">RESET LINK</span>
            </h2>
            <p className="text-xs font-bold text-muted-foreground max-w-[280px] leading-relaxed">
              This password reset link is invalid or missing a token. Please request a new reset email.
            </p>

            <Button
              onClick={() => navigate("/forgot-password")}
              className="w-full mt-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold uppercase tracking-wider text-xs py-3.5 cursor-pointer shadow-xs"
            >
              REQUEST NEW LINK
            </Button>
          </div>
        ) : isSuccess ? (
          /* Success State */
          <div className="flex flex-col items-center text-center space-y-4 w-full animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-lg font-extrabold text-foreground">
              PASSWORD <span className="text-primary">RESET SUCCESSFUL</span>
            </h2>
            <p className="text-xs font-bold text-muted-foreground max-w-[280px] leading-relaxed">
              Your password has been updated successfully. You can now log in with your new credentials.
            </p>

            <Button
              onClick={() => navigate("/login")}
              className="w-full mt-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold uppercase tracking-wider text-xs py-3.5 cursor-pointer shadow-xs"
            >
              PROCEED TO LOG IN
            </Button>
          </div>
        ) : (
          /* Form Section */
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <FieldGroup>
              <FieldSet className="text-center mb-8">
                <FieldLegend className="text-lg font-extrabold text-foreground mb-1">
                  SET NEW <span className="text-primary">PASSWORD</span>
                </FieldLegend>
                <FieldDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide max-w-[260px] mx-auto leading-snug">
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
                      <InputGroupInput
                        id="new-password"
                        type={togglePassword ? "text" : "password"}
                        required
                        placeholder="**********"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-auto bg-background border-border rounded-xl text-sm transition-colors placeholder:text-muted-foreground text-foreground"
                      />
                      <InputGroupAddon align="inline-start">
                        <Lock className="text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupAddon align="inline-end">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setTogglePassword(!togglePassword)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {togglePassword ? <Eye /> : <EyeClosed />}
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
                      <InputGroupInput
                        id="confirm-password"
                        type={toggleConfirmPassword ? "text" : "password"}
                        required
                        placeholder="**********"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-auto bg-background border-border rounded-xl text-sm transition-colors placeholder:text-muted-foreground text-foreground"
                      />
                      <InputGroupAddon align="inline-start">
                        <Lock className="text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupAddon align="inline-end">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setToggleConfirmPassword(!toggleConfirmPassword)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {toggleConfirmPassword ? <Eye /> : <EyeClosed />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>

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
