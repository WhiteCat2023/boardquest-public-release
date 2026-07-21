import {Route, Routes} from "react-router-dom";
import LandingPage from "./view/LandingPage";
import LoginPage from "./view/login/LoginPage";
import ForgotPasswordPage from "./view/login/ForgotPasswordPage";
import ResetPasswordPage from "./view/login/ResetPasswordPage";
import Dashboard from "./view/admin/Dashboard";
import MainLayout from "./layout/MainLayout";
import RequireAuth from "./components/RequireAuth";
import PersistentSession from "./components/PersistentSession";
import DashboardLayout from "./layout/DashboardLayout";
import { FacultyManagement, AddFacultyMember, ViewFacultyMember } from "./view/admin/faculty";
import StudentManagement from "./view/admin/StudentManagement";
import Curriculum from "./view/admin/Curriculum";
import ReviewCenter from "./view/admin/ReviewCenter";
import QuestionBank from "./view/admin/question_bank/QuestionBank";
import Analytics from "./view/admin/Analytics";
import Settings from "./view/admin/settings/Settings";
import ProfileSettings from "./view/admin/ProfileSettings";
import Missing from "./view/admin/Missing";
import Unauthorized from "./view/admin/Unauthorized";
import AddQuestion from "./view/admin/question_bank/AddQuestion";
import AddedQuestionUsingCSV from "./view/admin/question_bank/AddedQuestionUsingCSV";
import ViewQuestion from "./view/admin/question_bank/ViewQuestion";
import { Toaster } from "@/components/ui/sonner";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* public routes */}
          <Route path="home" element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />

          {/* private routes */}
          <Route element={<PersistentSession />}>
            <Route element={<DashboardLayout />}>
              <Route element={<RequireAuth allowedRoles={["SUPERADMIN", "ADMIN", "TEAMLEAD", "TEACHER"]} />}>
                <Route path="/" element={<Dashboard />} />
              </Route>

              <Route element={<RequireAuth allowedRoles={["SUPERADMIN", "ADMIN", "TEAMLEAD"]} />}>
                <Route path="faculty-management" element={<FacultyManagement />} />
                <Route path="faculty-management/create" element={<AddFacultyMember />} />
                <Route path="faculty-management/add" element={<AddFacultyMember />} />
                <Route path="faculty-management/view/:facultyId" element={<ViewFacultyMember />} />
                <Route path="student-management" element={<StudentManagement />} />
                <Route path="curriculum" element={<Curriculum />} />
              </Route>

              <Route element={<RequireAuth allowedRoles={["SUPERADMIN", "ADMIN", "TEAMLEAD"]} />}>
                <Route path="review-center" element={<ReviewCenter />} />
              </Route>

              <Route element={<RequireAuth allowedRoles={["SUPERADMIN", "ADMIN", "TEAMLEAD", "TEACHER"]} />}>
                <Route path="question-bank" element={<QuestionBank />} />
                <Route path="question-bank/create" element={<AddQuestion />} />
                <Route path="question-bank/edit/:questionId" element={<AddQuestion />} />
                <Route path="question-bank/view/:questionId" element={<ViewQuestion />} />
                <Route path="question-bank/import" element={<AddedQuestionUsingCSV />} />
              </Route>

              <Route element={<RequireAuth allowedRoles={["SUPERADMIN", "ADMIN", "TEAMLEAD"]} />}>
                <Route path="analytics" element={<Analytics />} />
              </Route>

              <Route element={<RequireAuth allowedRoles={["SUPERADMIN", "ADMIN", "TEAMLEAD"]} />}>
                <Route path="settings" element={<Settings />} />
              </Route>
              
              <Route path="profile-settings" element={<ProfileSettings />} />
            </Route>
          </Route>

          {/* catch all route */}
          <Route path="*" element={<Missing />} />
          <Route path="unauthorized" element={<Unauthorized />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App
