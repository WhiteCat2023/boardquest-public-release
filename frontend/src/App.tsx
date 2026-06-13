import { createBrowserRouter, RouterProvider, } from "react-router-dom"
import { publicRoutes } from "@/routes/public.route";
import {checkAuthorization} from "@/utils/checkAuthorization";
import { privateRoutes } from "@/routes/private.route";

const router = createBrowserRouter(checkAuthorization() ? privateRoutes : publicRoutes);

function App() {
  return <RouterProvider router={router} />
}

export default App
