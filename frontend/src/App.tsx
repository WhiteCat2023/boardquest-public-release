import {Route, Routes} from "react-router-dom";
import LandingPage from "./view/LandingPage";
import LoginPage from "./view/LoginPage";
import Dashboard from "./view/admin/Dashboard";
import MainLayout from "./layout/MainLayout";
import RequireAuth from "./components/RequireAuth";
import PersistentSession from "./components/PersistentSession";
import DashboardLayout from "./layout/DashboardLayout";
import FacultyManagement from "./view/admin/FacultyManagement";
import ReviewCenter from "./view/admin/ReviewCenter";
import QuestionBank from "./view/admin/QuestionBank";
import Analytics from "./view/admin/Analytics";
import Settings from "./view/admin/Settings";
import ProfileSettings from "./view/admin/ProfileSettings";
import Missing from "./view/admin/Missing";
import Unauthorized from "./view/admin/Unauthorized";

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
