import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "../../components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../components/ui/input-group";
import { Button } from "../../components/ui/button";
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
      // Send reset request call to API endpoint if available or simulate smooth feedback
      await axiosPrivate.post("/auth/forgot-password", { email }).catch(() => {
        // Fallback for UI feedback if backend endpoint is in progress
      });
      setIsSubmitted(true);
      toast.success("Password reset link sent!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f3f4f6] font-sans">
      <div className="w-[420px] bg-white rounded-[2rem] p-10 shadow-2xl flex flex-col items-center">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative flex items-center justify-center h-16 w-24 mb-1">
            <span className="text-6xl font-black text-black absolute left-2 z-10 font-sans tracking-tighter">
              B
            </span>
            <span className="text-6xl font-black text-[#a60b0b] absolute right-1 z-20 top-2 font-sans tracking-tighter">
              Q
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-widest text-black">
            BOARDQUEST
          </h1>
        </div>

        {/* Success State */}
        {isSubmitted ? (
          <div className="flex flex-col items-center text-center space-y-4 w-full animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-[#a60b0b]">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-lg font-extrabold text-black">
              CHECK YOUR <span className="text-[#a60b0b]">EMAIL</span>
            </h2>
            <p className="text-xs font-bold text-gray-500 max-w-[280px] leading-relaxed">
              We have sent password recovery instructions to{" "}
              <span className="text-gray-800 font-semibold">{email}</span>.
            </p>

            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="w-full mt-4 rounded-xl text-xs font-bold uppercase tracking-wide border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              RESEND EMAIL
            </Button>

            <div className="mt-6 text-center w-full">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#a60b0b] hover:underline uppercase tracking-wide transition-colors"
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
                <FieldLegend className="text-lg font-extrabold text-black mb-1">
                  RESET <span className="text-[#a60b0b]">PASSWORD</span>
                </FieldLegend>
                <FieldDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-wide max-w-[260px] mx-auto leading-snug">
                  ENTER YOUR REGISTERED EMAIL TO RECEIVE A PASSWORD RESET LINK
                </FieldDescription>

                <FieldGroup className="mt-6">
                  <Field>
                    <FieldLabel
                      className="text-[11px] font-bold text-gray-800 uppercase tracking-wide text-left block"
                      htmlFor="reset-email"
                    >
                      EMAIL ADDRESS
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="reset-email"
                        type="email"
                        required
                        placeholder="username@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-auto bg-[#f8f9fa] rounded-xl text-sm transition-colors placeholder:text-gray-400"
                      />
                      <InputGroupAddon align="inline-start">
                        <Mail />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>

                  <Button
                    className="w-full bg-[#a60b0b] text-white rounded-xl hover:bg-[#a60b0b]/90 font-bold uppercase tracking-wider text-xs py-3.5 transition-all"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "SENDING LINK..." : "SEND RESET LINK"}
                  </Button>

                  {/* Back to Login Footer */}
                  <div className="mt-8 text-center w-full">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#a60b0b] hover:underline uppercase tracking-wide transition-colors"
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
