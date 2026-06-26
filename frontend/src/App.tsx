// import { createBrowserRouter, RouterProvider, } from "react-router-dom"
// import { publicRoutes } from "@/routes/public.route";
// import {checkAuthorization} from "@/utils/checkAuthorization";
// import { privateRoutes } from "@/routes/private.route";

/** TEST */

import {Route, Routes} from "react-router-dom";
import LandingPage from "./components/pages/LandingPage";
import LoginPage from "./components/pages/LoginPage";
import Dashboard from "./components/pages/admin/Dashboard";
import MainLayout from "./layout/MainLayout";
import RequireAuth from "./components/utils/RequireAuth";
import PersistentSession from "./components/utils/PersistentSession";
import DashboardLayout from "./components/utils/DashboardLayout";

// const router = createBrowserRouter(checkAuthorization() ? privateRoutes : publicRoutes);

function App() {
  // return <RouterProvider router={router} />

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
          </Route>
        </Route>

        {/* catch all route */}
        {/* <Route path="*" element={<Missing />} /> */}
      </Route>
    </Routes>
  );
}

export default App
