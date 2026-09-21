import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
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

export function ReviewCenterForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setErrorMsg(null);
    setLoading(true);
    try {
      await rcAxios.post("/auth/forgot-password", { email: email.trim() });
      setIsSubmitted(true);
      toast.success("Password reset instructions sent to your email!");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to send password reset email. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
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

        {/* Success State */}
        {isSubmitted ? (
          <div className="flex flex-col items-center text-center space-y-4 w-full animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-lg font-extrabold text-foreground">
              CHECK YOUR <span className="text-primary">EMAIL</span>
            </h2>
            <p className="text-xs font-bold text-muted-foreground max-w-[280px] leading-relaxed">
              If an account with{" "}
              <span className="text-foreground font-semibold">{email}</span> exists,
              we have sent recovery instructions to reset your password.
            </p>

            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="w-full mt-4 rounded-xl text-xs font-bold uppercase tracking-wide border-border text-foreground hover:bg-accent cursor-pointer"
            >
              RESEND EMAIL
            </Button>

            <div className="mt-6 text-center w-full">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline uppercase tracking-wide transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> BACK TO LOG IN
              </Link>
            </div>
          </div>
        ) : (
          /* Form Section */
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <FieldGroup>
              <FieldSet className="text-center mb-8">
                <FieldLegend className="text-lg font-extrabold text-foreground mb-1">
                  RESET <span className="text-primary">PASSWORD</span>
                </FieldLegend>
                <FieldDescription className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wide max-w-[260px] mx-auto leading-snug">
                  ENTER YOUR REGISTERED EMAIL TO RECEIVE A PASSWORD RESET LINK
                </FieldDescription>

                <FieldGroup className="mt-6">
                  <Field>
                    <FieldLabel
                      className="text-[11px] font-bold text-foreground uppercase tracking-wide text-left block"
                      htmlFor="reset-email"
                    >
                      EMAIL ADDRESS
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <Mail className="size-4 text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="reset-email"
                        type="email"
                        required
                        placeholder="rep@reviewcenter.edu.ph"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </InputGroup>
                  </Field>

                  {errorMsg && (
                    <div className="text-xs font-bold text-destructive text-center">
                      {errorMsg}
                    </div>
                  )}

                  <Button
                    className="w-full bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold uppercase tracking-wider text-xs py-3.5 transition-all cursor-pointer shadow-xs"
                    type="submit"
                    disabled={loading || !email.trim()}
                  >
                    {loading ? "SENDING LINK..." : "SEND RESET LINK"}
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

export default ReviewCenterForgotPasswordPage;
