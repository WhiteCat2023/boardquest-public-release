import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import useAuth from "@/hooks/useAuth";
import { rcAxios } from "@/lib/axios";
import {
  StepIndicatorHeader,
  GreetingStep,
  TermsStep,
  PasswordStep,
  type FirstLoginStep,
} from "./first-login";

export const FirstLoginDialog: React.FC = () => {
  const { auth, setAuth, logout } = useAuth();
  const location = useLocation();

  const currentUser = auth?.data?.user || auth?.user;
  const userRole = String(currentUser?.role || "REVIEW_CENTER_REPRESENTATIVE");

  // If user is already on settings, avoid blocking them from updating their profile/password manually
  const isOnSettings = location.pathname.includes("/settings");

  // Determine if dialog should be displayed
  const shouldShow = Boolean(
    currentUser?.mustChangePassword === true &&
    !isOnSettings
  );

  // Determine starting step: if terms were already accepted in past, start at password step, else greeting
  const initialStep: FirstLoginStep = currentUser?.termsAcceptedAt
    ? "password"
    : "greeting";
  const [step, setStep] = useState<FirstLoginStep>(initialStep);

  // Step 2 (Terms & Privacy) states
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isSavingTerms, setIsSavingTerms] = useState(false);

  // Step 3 (Password Form) states
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle Step 2 -> Step 3 transition
  const handleAcceptTermsAndProceed = async () => {
    if (!acceptedTerms || !acceptedPrivacy) return;
    setIsSavingTerms(true);
    setErrorMessage(null);

    try {
      const response = await rcAxios.post("/auth/accept-terms");
      const updatedUser = response.data?.data?.user;

      setAuth((prev: any) => ({
        ...prev,
        data: {
          ...prev?.data,
          user: {
            ...prev?.data?.user,
            ...updatedUser,
            termsAcceptedAt: new Date(),
          },
        },
        user: {
          ...(prev?.user || {}),
          ...updatedUser,
          termsAcceptedAt: new Date(),
        },
      }));

      setStep("password");
    } catch (err: any) {
      console.error("Failed to accept review center terms:", err);
      // Allow proceeding in memory even if offline/fallback
      setStep("password");
    } finally {
      setIsSavingTerms(false);
    }
  };

  // Handle password submission
  const handlePasswordSubmit = async (
    password: string,
    confirmPassword: string
  ) => {
    setIsSubmittingPassword(true);
    setErrorMessage(null);

    try {
      const response = await rcAxios.post("/auth/first-login-setup", {
        password,
        confirmPassword,
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
      });

      const updatedUser = response.data?.data?.user;
      setIsSuccess(true);

      setTimeout(() => {
        setAuth((prev: any) => ({
          ...prev,
          data: {
            ...prev?.data,
            user: {
              ...prev?.data?.user,
              ...updatedUser,
              mustChangePassword: false,
            },
          },
          user: {
            ...(prev?.user || {}),
            ...updatedUser,
            mustChangePassword: false,
          },
        }));
      }, 1200);
    } catch (err: any) {
      console.error("Review center password change failed:", err);
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update password. Please ensure requirements are met.";
      setErrorMessage(apiMsg);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!shouldShow) return null;

  const displayName =
    currentUser?.firstName || currentUser?.name || "Representative";
  const companyName =
    currentUser?.companyName || currentUser?.reviewCenter?.name;

  return (
    <Dialog open={shouldShow} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={`w-[95vw] p-0 gap-0 overflow-hidden border-border/80 shadow-2xl bg-card transition-all duration-300 ${
          step === "terms"
            ? "sm:max-w-3xl md:max-w-4xl max-w-4xl max-h-[90vh]"
            : "sm:max-w-xl md:max-w-2xl max-w-2xl max-h-[88vh]"
        } flex flex-col`}
      >
        <StepIndicatorHeader userRole={userRole} step={step} />

        {step === "greeting" && (
          <GreetingStep
            displayName={displayName}
            companyName={companyName}
            onProceed={() => setStep("terms")}
            onLogout={handleLogout}
          />
        )}

        {step === "terms" && (
          <TermsStep
            acceptedTerms={acceptedTerms}
            onAcceptedTermsChange={setAcceptedTerms}
            acceptedPrivacy={acceptedPrivacy}
            onAcceptedPrivacyChange={setAcceptedPrivacy}
            isSavingTerms={isSavingTerms}
            onBack={() => setStep("greeting")}
            onAgreeAndContinue={handleAcceptTermsAndProceed}
          />
        )}

        {step === "password" && (
          <PasswordStep
            isSuccess={isSuccess}
            errorMessage={errorMessage}
            isSubmitting={isSubmittingPassword}
            onSubmit={handlePasswordSubmit}
            onBack={() => setStep("terms")}
            onLogout={handleLogout}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FirstLoginDialog;
