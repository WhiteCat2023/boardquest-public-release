import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import { RequireAuth } from "@/features/auth";
import { PersistentSession } from "@/features/auth";
import DashboardLayout from "./layout/DashboardLayout";
import SettingLayout from "./layout/SettingLayout";
import { Toaster } from "@/components/ui/sonner";

// Lazy-loaded page components for optimal bundle splitting
const LoginPage = lazy(() =>
  import("@/features/auth").then((m) => ({ default: m.LoginPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("@/features/auth").then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import("@/features/auth").then((m) => ({ default: m.ResetPasswordPage })),
);
const Dashboard = lazy(() =>
  import("@/features/dashboard").then((m) => ({ default: m.Dashboard })),
);

const FacultyManagement = lazy(() =>
  import("@/features/faculty").then((m) => ({ default: m.FacultyManagement })),
);
const AddFacultyMember = lazy(() =>
  import("@/features/faculty").then((m) => ({ default: m.AddFacultyMember })),
);
const ViewFacultyMember = lazy(() =>
  import("@/features/faculty").then((m) => ({ default: m.ViewFacultyMember })),
);

const StudentManagement = lazy(() =>
  import("@/features/students").then((m) => ({ default: m.StudentManagement })),
);
const EnrollStudentPage = lazy(() =>
  import("@/features/students").then((m) => ({ default: m.EnrollStudentPage })),
);
const AddedStudentUsingCSV = lazy(() =>
  import("@/features/students").then((m) => ({
    default: m.AddedStudentUsingCSV,
  })),
);
const ViewStudent = lazy(() =>
  import("@/features/students").then((m) => ({ default: m.ViewStudent })),
);

const ReviewCenterManagement = lazy(() =>
  import("@/features/review-center").then((m) => ({
    default: m.ReviewCenterManagement,
  })),
);
const CalendarManagement = lazy(() =>
  import("@/features/review-center").then((m) => ({
    default: m.CalendarManagement,
  })),
);
const LogsManagement = lazy(() =>
  import("@/features/logs").then((m) => ({ default: m.LogsManagement })),
);

const SubjectManagement = lazy(() =>
  import("@/features/question-bank").then((m) => ({
    default: m.SubjectManagement,
  })),
);
const SubjectDetailsPage = lazy(() =>
  import("@/features/question-bank").then((m) => ({
    default: m.SubjectDetailsPage,
  })),
);

const QuestionBank = lazy(() =>
  import("@/features/question-bank").then((m) => ({ default: m.QuestionBank })),
);
const MyQuestions = lazy(() =>
  import("@/features/question-bank").then((m) => ({ default: m.MyQuestions })),
);
const ReviewQuestions = lazy(() =>
  import("@/features/question-bank").then((m) => ({
    default: m.ReviewQuestions,
  })),
);
const SharedLibrary = lazy(() =>
  import("@/features/question-bank").then((m) => ({
    default: m.SharedLibrary,
  })),
);
const RevisionDesk = lazy(() =>
  import("@/features/question-bank").then((m) => ({ default: m.RevisionDesk })),
);
const AddQuestion = lazy(() =>
  import("@/features/question-bank").then((m) => ({ default: m.AddQuestion })),
);
const ViewQuestion = lazy(() =>
  import("@/features/question-bank").then((m) => ({ default: m.ViewQuestion })),
);
const AddedQuestionUsingCSV = lazy(() =>
  import("@/features/question-bank").then((m) => ({
    default: m.AddedQuestionUsingCSV,
  })),
);

const Analytics = lazy(() =>
  import("@/features/misc").then((m) => ({ default: m.Analytics })),
);
const Settings = lazy(() =>
  import("@/features/settings").then((m) => ({ default: m.Settings })),
);
const ProfileSettings = lazy(() =>
  import("@/features/settings").then((m) => ({ default: m.ProfileSettings })),
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
            {/* <Route path="home" element={<LandingPage />} /> */}
            <Route path="login" element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />

            {/* private routes */}
            <Route element={<PersistentSession />}>
              <Route element={<DashboardLayout />}>
                <Route
                  element={
                    <RequireAuth
                      allowedRoles={[
                        "SUPERADMIN",
                        "ADMIN",
                        "TEAMLEAD",
                        "TEACHER",
                      ]}
                    />
                  }
                >
                  <Route path="/" element={<Dashboard />} />
                </Route>

                <Route
                  element={
                    <RequireAuth
                      allowedRoles={["SUPERADMIN", "ADMIN", "TEAMLEAD"]}
                    />
                  }
                >
                  <Route
                    path="faculty-management"
                    element={<FacultyManagement />}
                  />
                  <Route
                    path="faculty-management/create"
                    element={<AddFacultyMember />}
                  />
                  {/* <Route
                  path="faculty-management/add"
                  element={<AddFacultyMember />}
                /> */}
                  <Route
                    path="faculty-management/view/:facultyId"
                    element={<ViewFacultyMember />}
                  />
                  <Route
                    path="faculty-management/import"
                    element={<AddFacultyMember />}
                  />
                  <Route
                    path="student-management"
                    element={<StudentManagement />}
                  />
                  <Route
                    path="student-management/create"
                    element={<EnrollStudentPage />}
                  />
                  <Route
                    path="student-management/import"
                    element={<AddedStudentUsingCSV />}
                  />
                  <Route
                    path="student-management/view/:studentId"
                    element={<ViewStudent />}
                  />
                </Route>

                <Route
                  element={
                    <RequireAuth
                      allowedRoles={["SUPERADMIN", "ADMIN", "TEAMLEAD"]}
                    />
                  }
                >
                  <Route
                    path="review-center"
                    element={<ReviewCenterManagement />}
                  />
                  <Route
                    path="calendar-management"
                    element={<CalendarManagement />}
                  />
                  <Route path="logs-management" element={<LogsManagement />} />
                </Route>

                <Route
                  element={
                    <RequireAuth
                      allowedRoles={[
                        "SUPERADMIN",
                        "ADMIN",
                        "TEAMLEAD",
                        "TEACHER",
                      ]}
                    />
                  }
                >
                  <Route
                    path="subject-management"
                    element={<SubjectManagement />}
                  />
                  <Route
                    path="subject-management/:categoryId"
                    element={<SubjectDetailsPage />}
                  />
                  <Route
                    path="subject-management/view/:categoryId"
                    element={<SubjectDetailsPage />}
                  />
                  <Route path="question-bank" element={<QuestionBank />} />
                  <Route
                    path="question-bank/my-questions"
                    element={<MyQuestions />}
                  />
                  <Route
                    path="question-bank/bank"
                    element={<SharedLibrary />}
                  />
                  <Route
                    path="question-bank/shared-library"
                    element={<SharedLibrary />}
                  />
                  <Route
                    path="question-bank/revisions"
                    element={<RevisionDesk />}
                  />
                  <Route path="revisions" element={<RevisionDesk />} />
                  <Route
                    path="question-bank/create"
                    element={<AddQuestion />}
                  />
                  <Route
                    path="question-bank/edit/:questionId"
                    element={<AddQuestion />}
                  />
                  <Route
                    path="question-bank/view/:questionId"
                    element={<ViewQuestion />}
                  />
                  <Route
                    path="question-bank/:questionId"
                    element={<ViewQuestion />}
                  />
                  <Route
                    path="question-bank/import"
                    element={<AddedQuestionUsingCSV />}
                  />
                </Route>

                <Route
                  element={
                    <RequireAuth
                      allowedRoles={["SUPERADMIN", "ADMIN", "TEAMLEAD"]}
                    />
                  }
                >
                  <Route
                    path="question-bank/review"
                    element={<ReviewQuestions />}
                  />
                  <Route
                    path="question-bank/review-questions"
                    element={<ReviewQuestions />}
                  />
                  <Route path="analytics" element={<Analytics />} />
                </Route>

                <Route
                  element={
                    <RequireAuth
                      allowedRoles={["SUPERADMIN", "ADMIN", "TEAMLEAD"]}
                    />
                  }
                >
                  <Route element={<SettingLayout />}>
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                <Route path="profile-settings" element={<ProfileSettings />} />
              </Route>
            </Route>

            {/* catch all route */}
            <Route path="*" element={<Missing />} />
            <Route path="unauthorized" element={<Unauthorized />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
