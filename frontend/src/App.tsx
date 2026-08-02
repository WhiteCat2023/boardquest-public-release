import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import RequireAuth from "./components/RequireAuth";
import PersistentSession from "./components/PersistentSession";
import DashboardLayout from "./layout/DashboardLayout";
import SettingLayout from "./layout/SettingLayout";
import { Toaster } from "@/components/ui/sonner";

// Lazy-loaded page components for optimal bundle splitting
const LoginPage = lazy(() => import("./view/login/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./view/login/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./view/login/ResetPasswordPage"));
const Dashboard = lazy(() => import("./view/admin/dashboard/Dashboard"));

const FacultyManagement = lazy(() => import("./view/admin/faculty/FacultyManagement"));
const AddFacultyMember = lazy(() => import("./view/admin/faculty/AddFacultyMember"));
const ViewFacultyMember = lazy(() => import("./view/admin/faculty/ViewFacultyMember"));

const StudentManagement = lazy(() => import("./view/admin/StudentManagement"));
const EnrollStudentPage = lazy(() => import("./view/admin/student_management/EnrollStudentPage"));
const AddedStudentUsingCSV = lazy(() => import("./view/admin/student_management/AddedStudentUsingCSV"));
const ViewStudent = lazy(() => import("./view/admin/student_management/ViewStudent"));

const ReviewCenterManagement = lazy(() => import("./view/admin/review_center/ReviewCenterManagement"));
const CalendarManagement = lazy(() => import("./view/admin/CalendarManagement"));
const LogsManagement = lazy(() => import("./view/admin/logs_management/LogsManagement"));

const SubjectManagement = lazy(() => import("./view/admin/subject_management/SubjectManagement"));
const SubjectDetailsPage = lazy(() => import("./view/admin/subject_management/SubjectDetailsPage"));

const QuestionBank = lazy(() => import("./view/admin/question_bank/QuestionBank"));
const MyQuestions = lazy(() => import("./view/admin/question_bank/MyQuestions"));
const ReviewQuestions = lazy(() => import("./view/admin/question_bank/ReviewQuestions"));
const SharedLibrary = lazy(() => import("./view/admin/question_bank/SharedLibrary"));
const RevisionDesk = lazy(() => import("./view/admin/question_bank/RevisionDesk"));
const AddQuestion = lazy(() => import("./view/admin/question_bank/AddQuestion"));
const ViewQuestion = lazy(() => import("./view/admin/question_bank/ViewQuestion"));
const AddedQuestionUsingCSV = lazy(() => import("./view/admin/question_bank/AddedQuestionUsingCSV"));

const Analytics = lazy(() => import("./view/admin/Analytics"));
const Settings = lazy(() => import("./view/admin/settings/Settings"));
const ProfileSettings = lazy(() => import("./view/admin/ProfileSettings"));

const Missing = lazy(() => import("./view/admin/Missing"));
const Unauthorized = lazy(() => import("./view/admin/Unauthorized"));

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
                <Route path="question-bank/bank" element={<SharedLibrary />} />
                <Route
                  path="question-bank/shared-library"
                  element={<SharedLibrary />}
                />
                <Route
                  path="question-bank/revisions"
                  element={<RevisionDesk />}
                />
                <Route path="revisions" element={<RevisionDesk />} />
                <Route path="question-bank/create" element={<AddQuestion />} />
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
