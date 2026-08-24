import { useState } from "react";
import { type LoginRequest } from "@/types/types";
import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Mail, Lock, EyeClosed, Eye, UserX, ShieldAlert } from "lucide-react";
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

function LoginPage() {
  const { login, loginMutation } = useAuth();
  const [loginInputs, setLoginInputs] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const [togglePassword, setTogglePassword] = useState(false);
  const [isDeactivatedDialogOpen, setIsDeactivatedDialogOpen] = useState(false);
  const [deactivatedMsg, setDeactivatedMsg] = useState(
    "Your account has been deactivated. Please contact your system administrator or Dean for assistance."
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginInputs);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message || "";
      if (status === 403 || message.toLowerCase().includes("deactivated")) {
        if (message) setDeactivatedMsg(message);
        setIsDeactivatedDialogOpen(true);
      }
    }
  };

  const isLoginInvalid = loginMutation.isError && !isDeactivatedDialogOpen;

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

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <FieldGroup>
            <FieldSet className="text-center mb-8">
              <FieldLegend className="text-lg font-extrabold text-foreground mb-1">
                ASPIRANT <span className="text-primary">LOG IN</span>
              </FieldLegend>
              <FieldDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide max-w-[250px] mx-auto leading-snug">
                ENTER YOUR CREDENTIALS TO CONTINUE THE REVIEW
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
                    <InputGroupInput
                      aria-invalid={isLoginInvalid || undefined}
                      type="email"
                      required
                      placeholder="admin@swumedtech.edu.ph"
                      value={loginInputs.email}
                      onChange={(e) =>
                        setLoginInputs({
                          ...loginInputs,
                          email: e.target.value,
                        })
                      }
                      className="w-full bg-background border-border rounded-xl text-sm transition-colors placeholder:text-muted-foreground text-foreground"
                    />
                    <InputGroupAddon align="inline-start">
                      <Mail className="text-muted-foreground" />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel className="text-[11px] font-bold text-foreground uppercase tracking-wide">
                    PASSWORD
                  </FieldLabel>

                  <InputGroup data-invalid={isLoginInvalid || undefined}>
                    <InputGroupInput
                      type={togglePassword ? "text" : "password"}
                      aria-invalid={isLoginInvalid || undefined}
                      required
                      placeholder="**********"
                      value={loginInputs.password}
                      onChange={(e) =>
                        setLoginInputs({
                          ...loginInputs,
                          password: e.target.value,
                        })
                      }
                      className="w-full bg-background border-border rounded-xl text-sm transition-colors placeholder:text-muted-foreground text-foreground"
                    />
                    <InputGroupAddon align="inline-start">
                      <Lock className="text-muted-foreground" />
                    </InputGroupAddon>

                    <InputGroupAddon align="inline-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setTogglePassword(!togglePassword)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {togglePassword ? <Eye /> : <EyeClosed />}
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
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
                {/* Footer */}
                <div className="mt-8 text-center w-full">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    NEW TO EXPEDITION?{" "}
                    <Link
                      to="/register"
                      className="text-primary hover:underline"
                    >
                      ENROLL NOW
                    </Link>
                  </p>
                </div>

                {isLoginInvalid && (
                  <div className="mt-4 text-xs font-bold text-destructive text-center">
                    {(loginMutation.error as any)?.response?.data?.message ||
                      (loginMutation.error as any)?.message ||
                      "Login failed"}
                  </div>
                )}
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </form>
      </div>

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
                Your account is currently <strong className="text-destructive font-bold">deactivated</strong>. You cannot access the BoardQuest administrative platform while your status is inactive.
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

export default LoginPage;