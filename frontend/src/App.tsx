import {Route, Routes} from "react-router-dom";
import LandingPage from "./components/pages/LandingPage";
import LoginPage from "./components/pages/LoginPage";
import Dashboard from "./components/pages/admin/Dashboard";
import MainLayout from "./layout/MainLayout";
import RequireAuth from "./components/utils/RequireAuth";
import PersistentSession from "./components/utils/PersistentSession";
import DashboardLayout from "./components/utils/DashboardLayout";
import FacultyManagement from "./components/pages/admin/FacultyManagement";
import ReviewCenter from "./components/pages/admin/ReviewCenter";
import QuestionBank from "./components/pages/admin/question_bank/QuestionBank";
import Analytics from "./components/pages/admin/Analytics";
import Settings from "./components/pages/admin/Settings";
import ProfileSettings from "./components/pages/admin/ProfileSettings";
import Missing from "./components/pages/admin/Missing";
import Unauthorized from "./components/pages/admin/Unauthorized";

function App() {

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* public routes */}
        <Route path="home" element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />

        {/* private routes */}
        <Route element={<PersistentSession />}>
          <Route element={<DashboardLayout />}>
            <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
              <Route path="/" element={<Dashboard />} />
            </Route>

            <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
              <Route path="faculty-management" element={<FacultyManagement />} />
            </Route>

            <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
              <Route path="review-center" element={<ReviewCenter />} />
            </Route>

            <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
              <Route path="question-bank" element={<QuestionBank />} />
            </Route>

            <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
              <Route path="analytics" element={<Analytics />} />
            </Route>

            <Route element={<RequireAuth allowedRoles={["SUPERADMIN"]} />}>
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
  );
}

export default App
