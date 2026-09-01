import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import { RequireAuth } from "@/features/auth";
import { PersistentSession } from "@/features/auth";
import DashboardLayout from "./layout/DashboardLayout";
import SettingLayout from "./layout/SettingLayout";
import { Toaster } from "@/components/ui/sonner";

// Lazy-loaded page components for optimal bundle splitting
const LoginPage = lazy(
  () => import("@/features/auth/pages/ReviewCenterLoginPage")
);
const ForgotPasswordPage = lazy(
  () => import("@/features/auth/pages/ReviewCenterForgotPasswordPage")
);
const ResetPasswordPage = lazy(
  () => import("@/features/auth/pages/ReviewCenterResetPasswordPage")
);

const Dashboard = lazy(() =>
  import("@/features/dashboard").then((m) => ({ default: m.Dashboard })),
);
const SchoolYearsPage = lazy(() =>
  import("@/features/students").then((m) => ({ default: m.SchoolYearsPage })),
);
const SchoolYearStudentsPage = lazy(() =>
  import("@/features/students").then((m) => ({
    default: m.SchoolYearStudentsPage,
  })),
);
const AddStudentsPage = lazy(() =>
  import("@/features/students").then((m) => ({
    default: m.AddStudentsPage,
  })),
);
const SchedulesPage = lazy(() =>
  import("@/features/schedules").then((m) => ({ default: m.SchedulesPage })),
);
const ScoresDashboardPage = lazy(() =>
  import("@/features/scores").then((m) => ({ default: m.ScoresDashboardPage })),
);
const SubjectScoresPage = lazy(() =>
  import("@/features/scores").then((m) => ({ default: m.SubjectScoresPage })),
);
const AssessmentScoresPage = lazy(() =>
  import("@/features/scores").then((m) => ({ default: m.AssessmentScoresPage })),
);
const SettingsPage = lazy(() =>
  import("@/features/settings").then((m) => ({ default: m.SettingsPage })),
);

const Missing = lazy(() =>
  import("@/features/misc").then((m) => ({ default: m.Missing })),
);
const Unauthorized = lazy(() =>
  import("@/features/misc").then((m) => ({ default: m.Unauthorized })),
);

function PageFallback() {
  return (
    <div className="flex h-64 w-full items-center justify-center font-sans text-sm text-muted-foreground animate-pulse">
      Loading...
    </div>
  );
}

function App() {
  return (
    <>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* public routes */}
            <Route path="login" element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />

            {/* private routes */}
            <Route element={<PersistentSession />}>
              <Route element={<DashboardLayout />}>
                <Route
                  element={
                    <RequireAuth
                      allowedRoles={["REVIEW_CENTER_REPRESENTATIVE"]}
                    />
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="candidates" element={<SchoolYearsPage />} />
                  <Route path="candidates/add" element={<AddStudentsPage />} />
                  <Route
                    path="candidates/:schoolYear"
                    element={<SchoolYearStudentsPage />}
                  />
                  <Route
                    path="candidates/:schoolYear/add"
                    element={<AddStudentsPage />}
                  />
                  <Route path="students" element={<SchoolYearsPage />} />
                  <Route path="students/add" element={<AddStudentsPage />} />
                  <Route
                    path="students/:schoolYear"
                    element={<SchoolYearStudentsPage />}
                  />
                  <Route
                    path="students/:schoolYear/add"
                    element={<AddStudentsPage />}
                  />
                  <Route path="scores" element={<ScoresDashboardPage />} />
                  <Route
                    path="scores/:schoolYear"
                    element={<ScoresDashboardPage />}
                  />
                  <Route
                    path="scores/subject/:subjectSlug"
                    element={<SubjectScoresPage />}
                  />
                  <Route
                    path="scores/:schoolYear/subject/:subjectSlug"
                    element={<SubjectScoresPage />}
                  />
                  <Route
                    path="scores/assessment/:assessmentId"
                    element={<AssessmentScoresPage />}
                  />
                  <Route
                    path="scores/subject/:subjectSlug/assessment/:assessmentId"
                    element={<AssessmentScoresPage />}
                  />
                  <Route
                    path="scores/:schoolYear/subject/:subjectSlug/assessment/:assessmentId"
                    element={<AssessmentScoresPage />}
                  />
                  <Route path="schedules" element={<SchedulesPage />} />
                </Route>

                <Route
                  element={
                    <RequireAuth
                      allowedRoles={["REVIEW_CENTER_REPRESENTATIVE"]}
                    />
                  }
                >
                  <Route element={<SettingLayout />}>
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            {/* catch all route */}
            <Route path="unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Missing />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
