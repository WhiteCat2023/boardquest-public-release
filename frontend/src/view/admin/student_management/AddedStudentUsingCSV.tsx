import { Navigate } from "react-router-dom";

export default function AddedStudentUsingCSV() {
  return <Navigate to="/student-management/create?tab=bulk" replace />;
}
