import { useState } from "react";
import { type LoginRequest } from "@/types/types";
import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Mail, Lock, EyeClosed, Eye } from "lucide-react";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "../../components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../components/ui/input-group"
import { Button } from "../../components/ui/button";

function LoginPage() {

  const { login, loginMutation } = useAuth();

  const [loginInputs, setLoginInputs] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const [togglePassword, setTogglePassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginInputs);
  }

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
        {/*Form Section*/}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <FieldGroup>
            <FieldSet className="text-center mb-8">
              <FieldLegend className="text-lg font-extrabold text-black mb-1">
                ASPIRANT <span className="text-[#a60b0b]">LOG IN</span>
              </FieldLegend>
              <FieldDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-wide max-w-[250px] mx-auto leading-snug">
                ENTER YOUR CREDENTIALS TO CONTINUE THE REVIEW
              </FieldDescription>
              <FieldGroup>
                <Field>
                  <FieldLabel className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
                    EMAIL ADRESS
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
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
                      className="w-full bg-[#f8f9fa rounded-xl text-sm transition-colors placeholder:text-gray-400"
                    />
                    <InputGroupAddon align="inline-start">
                      <Mail />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
                    PASSWORD
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      type={togglePassword ? "text" : "password"}
                      required
                      placeholder="**********"
                      value={loginInputs.password}
                      onChange={(e) =>
                        setLoginInputs({
                          ...loginInputs,
                          password: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8f9fa rounded-xl text-sm transition-colors placeholder:text-gray-400"
                    />
                    <InputGroupAddon align="inline-start">
                      <Lock />
                    </InputGroupAddon>

                    <InputGroupAddon align="inline-end" >
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setTogglePassword(!togglePassword)}
                      >
                        {togglePassword ? <Eye /> : <EyeClosed />}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>

                </Field>
                <Button
                  className="w-full bg-[#a60b0b] text-white rounded-xl hover:bg-[#a60b0b]/90"
                  type="submit"
                  disabled={loginMutation.isPending}
                >
                  Login
                </Button>
                {/* Footer */}
                <div className="mt-8 text-center w-full">
                  <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">
                    NEW TO EXPEDITION?{" "}
                    <Link
                      to="/register"
                      className="text-[#a60b0b] hover:underline"
                    >
                      ENROLL NOW
                    </Link>
                  </p>
                </div>

                {loginMutation.isError && (
                  <div className="mt-4 text-xs font-bold text-red-500 text-center">
                    {loginMutation.error instanceof Error
                      ? loginMutation.error.message
                      : "Login failed"}
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