import { useState } from "react";
import { type LoginRequest } from "@/types/types";
import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Mail, Lock, EyeClosed, Eye } from "lucide-react";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "../../components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../components/ui/input-group";
import { Button } from "../../components/ui/button";

function LoginPage() {
  const { login, loginMutation } = useAuth();
  const isLoginInvalid = loginMutation.isError;
  const [loginInputs, setLoginInputs] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const [togglePassword, setTogglePassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginInputs);
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
                      placeholder="username@gmail.com"
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
                        className="text-muted-foreground hover:text-foreground"
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
    </div>
  );
}

export default LoginPage;