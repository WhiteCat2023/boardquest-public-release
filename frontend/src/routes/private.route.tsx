import { createRoutesFromElements, Route } from "react-router-dom";
import Dashboard from "@/pages/admin/Dashboard";

export const privateRoutes = createRoutesFromElements(
  <>
    <Route index element={<Dashboard />} />
  </>,
);
