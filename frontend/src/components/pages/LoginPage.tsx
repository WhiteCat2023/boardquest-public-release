import { useState } from "react";
import { type LoginRequest } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { ValidateLoginInput } from "../../utils/ValidateInput";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "../ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { Button } from "../ui/button";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const { setAuth } = useAuth();
  const axiosPrivate = useAxiosPrivate();


  const [loginInputs, setLoginInputs] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await axiosPrivate.post("/auth/login", credentials);
      return response.data;
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validateLoginInput = ValidateLoginInput(loginInputs)
      if (!validateLoginInput.success) {
        return console.error("Login failed:", validateLoginInput.error.flatten().fieldErrors);
      }
      const { isError, data } = await loginMutation.mutateAsync(loginInputs);
      if (isError) return console.error("Login failed:", loginMutation.error);
      setAuth(data);
      console.log("Login successful:", data);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

    return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f3f4f6] font-sans">
      <div className="w-[420px] bg-white rounded-[2rem] p-10 shadow-2xl flex flex-col items-center">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative flex items-center justify-center h-16 w-24 mb-1">
            <span className="text-6xl font-black text-black absolute left-2 z-10 font-sans tracking-tighter">B</span>
            <span className="text-6xl font-black text-[#a60b0b] absolute right-1 z-20 top-2 font-sans tracking-tighter">Q</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-widest text-black">BOARDQUEST</h1>
        </div>

       <FieldGroup>
        <FieldSet className="text-center mb-8">
          <FieldLegend className="text-lg font-extrabold text-black mb-1">ASPIRANT <span className="text-[#a60b0b]">LOG IN</span></FieldLegend>
          <FieldDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-wide max-w-[250px] mx-auto leading-snug">
            ENTER YOUR CREDENTIALS TO CONTINUE THE REVIEW
          </FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">EMAIL ADRESS</FieldLabel>
              <InputGroup>
                <InputGroupInput type="email"
                required
                placeholder="username@gmail.com"
                value={loginInputs.email}
                onChange={(e) => setLoginInputs({ ...loginInputs, email: e.target.value })}
                className="w-full bg-[#f8f9fa rounded-xl text-sm transition-colors placeholder:text-gray-400"
              />
                <InputGroupAddon align="inline-start">
                  <Mail />
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">PASSWORD</FieldLabel>
              <InputGroup>
                <InputGroupInput type="password"
                required
                placeholder="**********"
                value={loginInputs.password}
                onChange={(e) => setLoginInputs({ ...loginInputs, password: e.target.value })}
                className="w-full bg-[#f8f9fa rounded-xl text-sm transition-colors placeholder:text-gray-400"
              />
                <InputGroupAddon align="inline-start">
                  <Lock />
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Button className="w-full bg-[#a60b0b] text-white rounded-xl hover:bg-[#a60b0b]/90">
              Login
            </Button>
          </FieldGroup>
        </FieldSet>
       </FieldGroup>
      </div>
    </div>
  );

  // return (
  //   <div className="min-h-screen w-full flex items-center justify-center bg-[#f3f4f6] font-sans">
  //     <div className="w-[420px] bg-white rounded-[2rem] p-10 shadow-2xl flex flex-col items-center">
  //       {/* Logo Section */}
  //       <div className="flex flex-col items-center mb-6">
  //         <div className="relative flex items-center justify-center h-16 w-24 mb-1">
  //           <span className="text-6xl font-black text-black absolute left-2 z-10 font-sans tracking-tighter">B</span>
  //           <span className="text-6xl font-black text-[#a60b0b] absolute right-1 z-20 top-2 font-sans tracking-tighter">Q</span>
  //         </div>
  //         <h1 className="text-xl font-extrabold tracking-widest text-black">BOARDQUEST</h1>
  //       </div>

  //       {/* Title */}
  //       <div className="text-center mb-8">
  //         <h2 className="text-lg font-extrabold text-black mb-1">
  //           ASPIRANT <span className="text-[#a60b0b]">LOG IN</span>
  //         </h2>
  //         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide max-w-[250px] mx-auto leading-snug">
  //           ENTER YOUR CREDENTIALS TO CONTINUE THE REVIEW
  //         </p>
  //       </div>

  //       {/* Form */}
  //       <form onSubmit={handleLogin} className="w-full space-y-5">
  //         <div className="space-y-1.5">
  //           <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
  //             EMAIL ADRESS
  //           </label>
  //           <div className="relative">
  //             <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
  //               <Mail className="h-4 w-4 text-gray-400" />
  //             </div>
  //             <input
  //               type="email"
  //               required
  //               className="w-full pl-11 pr-4 py-3 bg-[#f8f9fa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#a60b0b] focus:border-[#a60b0b] transition-colors placeholder:text-gray-400"
  //               placeholder="username@gmail.com"
  //               value={loginInputs.email}
  //               onChange={(e) => setLoginInputs({ ...loginInputs, email: e.target.value })}
  //             />
  //           </div>
  //         </div>

  //         <div className="space-y-1.5">
  //           <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
  //             PASSWORD
  //           </label>
  //           <div className="relative">
  //             <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
  //               <Lock className="h-4 w-4 text-gray-400" />
  //             </div>
  //             <input
  //               type="password"
  //               required
  //               className="w-full pl-11 pr-4 py-3 bg-[#f8f9fa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#a60b0b] focus:border-[#a60b0b] transition-colors tracking-widest placeholder:text-gray-400"
  //               placeholder="**********"
  //               value={loginInputs.password}
  //               onChange={(e) => setLoginInputs({ ...loginInputs, password: e.target.value })}
  //             />
  //           </div>
  //         </div>

  //         <div className="pt-2">
  //           <button
  //             type="submit"
  //             disabled={loginMutation.isPending}
  //             className="w-full bg-[#801313] hover:bg-[#680f0f] text-white font-bold py-3.5 rounded-xl flex items-center justify-center transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
  //           >
  //             <span className="mr-2 text-sm tracking-wide">{loginMutation.isPending ? "LOGGING IN..." : "LOG IN"}</span>
  //             <ArrowRight className="h-4 w-4 stroke-[3]" />
  //           </button>
  //         </div>
  //       </form>

  //       {/* Footer */}
  //       <div className="mt-8 text-center w-full">
  //         <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">
  //           NEW TO EXPEDITION?{" "}
  //           <Link to="/register" className="text-[#a60b0b] hover:underline">
  //             ENROLL NOW
  //           </Link>
  //         </p>
  //       </div>

  //       {loginMutation.isError && (
  //         <div className="mt-4 text-xs font-bold text-red-500 text-center">
  //           {loginMutation.error instanceof Error
  //             ? loginMutation.error.message
  //             : "Login failed"}
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
}

export default LoginPage;