import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";
import { Mail, Lock, EyeClosed, Eye, UserX, ShieldAlert } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ReviewCenterLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";
  const { user, login, isLoading } = useReviewCenterAuth();

  const [loginInputs, setLoginInputs] = useState({
    email: "",
    password: "",
  });

  const [togglePassword, setTogglePassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDeactivatedDialogOpen, setIsDeactivatedDialogOpen] = useState(false);
  const [deactivatedMsg, setDeactivatedMsg] = useState(
    "Your partner account has been deactivated. Please contact your system administrator or Dean for assistance."
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
      await login(loginInputs);
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
        if (
          !message ||
          message.includes("invocation") ||
          message.includes("Prisma") ||
          message.includes("Internal Server")
        ) {
          setLocalError(
            "Invalid email or password. Please check your credentials and try again."
          );
        } else {
          setLocalError(message);
        }
      }
    }
  };

  const isLoginInvalid = Boolean(localError) && !isDeactivatedDialogOpen;

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-background text-foreground font-sans p-4 sm:p-6">
      <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-8">
        <div className="w-full max-w-[420px] bg-card border border-border rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col items-center">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={boardQuestLogo}
              alt="BoardQuest Logo"
              className="h-16 sm:h-20 w-auto object-contain mb-1"
            />
          </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <FieldGroup>
            <FieldSet className="text-center mb-8">
              <FieldLegend className="text-lg font-extrabold text-foreground mb-1">
                REVIEW CENTER <span className="text-primary">LOG IN</span>
              </FieldLegend>
              <FieldDescription className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wide max-w-[250px] mx-auto leading-snug">
                ENTER YOUR CREDENTIALS TO ACCESS YOUR PORTAL
              </FieldDescription>
              <FieldGroup>
                <Field data-invalid={isLoginInvalid || undefined}>
                  <FieldLabel
                    className="text-[11px] font-bold text-foreground uppercase tracking-wide"
                    htmlFor="input-invalid"
                  >
                    EMAIL ADDRESS
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Mail className="size-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="input-email"
                      aria-invalid={isLoginInvalid || undefined}
                      type="email"
                      required
                      placeholder="rep@reviewcenter.edu.ph"
                      value={loginInputs.email}
                      onChange={(e) => {
                        setLoginInputs({
                          ...loginInputs,
                          email: e.target.value,
                        });
                        if (localError) setLocalError(null);
                      }}
                    />
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel className="text-[11px] font-bold text-foreground uppercase tracking-wide">
                    PASSWORD
                  </FieldLabel>

                  <InputGroup data-invalid={isLoginInvalid || undefined}>
                    <InputGroupAddon align="inline-start">
                      <Lock className="size-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="input-password"
                      type={togglePassword ? "text" : "password"}
                      aria-invalid={isLoginInvalid || undefined}
                      required
                      placeholder="**********"
                      value={loginInputs.password}
                      onChange={(e) => {
                        setLoginInputs({
                          ...loginInputs,
                          password: e.target.value,
                        });
                        if (localError) setLocalError(null);
                      }}
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
                  <div className="flex justify-end w-full mt-1.5">
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wide transition-colors"
                    >
                      FORGOT PASSWORD?
                    </Link>
                  </div>
                </Field>
                <Button
                  className="w-full bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 cursor-pointer shadow-xs font-semibold"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>

                {isLoginInvalid && (
                  <div className="mt-4 text-xs font-bold text-destructive text-center">
                    {localError}
                  </div>
                )}
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </form>
      </div>
    </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-muted-foreground select-none shrink-0">
        <p className="tracking-wide">
          &copy; {new Date().getFullYear()} <span className="font-semibold text-foreground/80">BoardQuest</span>. All rights reserved.
        </p>
      </footer>

      {/* Account Deactivated Notification Modal Dialog */}
      <AlertDialog
        open={isDeactivatedDialogOpen}
        onOpenChange={setIsDeactivatedDialogOpen}
      >
        <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-2xl max-w-md text-foreground font-sans animate-in zoom-in-95 duration-200">
          <AlertDialogHeader className="flex flex-row items-start gap-4 text-left">
            <div className="p-3 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shrink-0 mt-0.5">
              <UserX size={24} className="stroke-[2.5]" />
            </div>
            <div className="space-y-1.5 flex-1">
              <AlertDialogTitle className="text-base font-bold text-foreground">
                Account Deactivated
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Your partner account is currently <strong className="text-destructive font-bold">deactivated</strong>. You cannot access the BoardQuest review center platform while your status is inactive.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/80 text-xs text-muted-foreground flex items-start gap-2.5 my-2">
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

          <AlertDialogFooter className="mt-4">
            <AlertDialogAction
              onClick={() => setIsDeactivatedDialogOpen(false)}
              className="w-full rounded-xl text-xs font-semibold h-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
            >
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ReviewCenterLoginPage;
