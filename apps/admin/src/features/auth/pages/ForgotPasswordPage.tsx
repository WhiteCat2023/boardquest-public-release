import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import boardQuestLogo from "@/assets/boardquest.png";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await axiosPrivate.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
      toast.success("Password reset link sent to your email!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send password reset email.");
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
              We have sent password recovery instructions to{" "}
              <span className="text-foreground font-semibold">{email}</span>.
            </p>

            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="w-full mt-4 rounded-xl text-xs font-bold uppercase tracking-wide border-border text-foreground hover:bg-accent"
            >
              RESEND EMAIL
            </Button>

            <div className="mt-6 text-center w-full">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline uppercase tracking-wide transition-colors"
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
                      <InputGroupInput
                        id="reset-email"
                        type="email"
                        required
                        placeholder="admin@swumedtech.edu.ph"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-auto bg-background border-border rounded-xl text-sm transition-colors placeholder:text-muted-foreground text-foreground"
                      />
                      <InputGroupAddon align="inline-start">
                        <Mail className="text-muted-foreground" />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>

                  <Button
                    className="w-full bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold uppercase tracking-wider text-xs py-3.5 transition-all cursor-pointer shadow-xs"
                    type="submit"
                    disabled={loading}
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
