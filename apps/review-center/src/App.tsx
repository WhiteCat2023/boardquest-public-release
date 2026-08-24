import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ReviewCenterAuthProvider } from "./context/ReviewCenterAuthProvider";
import { useReviewCenterAuth } from "./hooks/useReviewCenterAuth";
import ReviewCenterLoginPage from "./pages/ReviewCenterLoginPage";
import ReviewCenterDashboard from "./pages/ReviewCenterDashboard";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useReviewCenterAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-3">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Verifying Review Center credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicAuthRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useReviewCenterAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-3">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <ReviewCenterAuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicAuthRoute>
                <ReviewCenterLoginPage />
              </PublicAuthRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ReviewCenterDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ReviewCenterAuthProvider>
    </BrowserRouter>
  );
}

export default App;
