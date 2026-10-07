import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReviewCenterAuthProvider } from "./context/AuthProvider";
import { SchoolYearProvider } from "./context/SchoolYearContext";
import { BrowserRouter } from "react-router-dom";

export const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ReviewCenterAuthProvider>
          <SchoolYearProvider>
            <App />
          </SchoolYearProvider>
        </ReviewCenterAuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
