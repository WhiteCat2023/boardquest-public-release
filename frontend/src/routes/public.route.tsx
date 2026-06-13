import { createRoutesFromElements, Route} from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import LandingPage from "@/pages/LandingPage";

export const publicRoutes = createRoutesFromElements(
    <> 
        <Route index element={<LandingPage />} />
        <Route path="/login"  element={<LoginPage />} />
    </>
)
