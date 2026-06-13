import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { type LoginRequest } from "@/types/types";
import {Button} from "@/components/ui/button";
import AxiosInstance from "@/utils/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

function LoginPage() {

   const navigate = useNavigate();

  const [loginInputs, setLoginInputs] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) =>
      AxiosInstance.post("/auth/login", credentials),
  });

  const handleLogin = async () => {
    try {
      const { isError, data }= await loginMutation.mutateAsync(loginInputs);
      if (isError) return console.error("Login failed:", loginMutation.error);
      console.log("Login successful:", data);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <>
      <Field>
        <FieldLabel htmlFor="input-field-username">Email</FieldLabel>
        <Input
          id="input-field-email"
          type="text"
          placeholder="Enter your email"
          value={loginInputs.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLoginInputs({ ...loginInputs, email: e.target.value.toString() })
          }
        />
        <FieldDescription>
          Choose a unique email for your account.
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="input-field-username">Password</FieldLabel>
        <Input
          id="input-field-password"
          type="text"
          placeholder="Enter your password"
          value={loginInputs.password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLoginInputs({
              ...loginInputs,
              password: e.target.value.toString(),
            })
          }
        />
        <FieldDescription>
          Choose a unique password for your account.
        </FieldDescription>
      </Field>
      <Button onClick={() => handleLogin()} disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Logging in..." : "Login"}
      </Button>

      {loginMutation.isError && (
        <FieldDescription className="text-red-500">
          {loginMutation.error instanceof Error
            ? loginMutation.error.message
            : "Login failed"}
        </FieldDescription>
      )}
    </>
  );
}

export default LoginPage