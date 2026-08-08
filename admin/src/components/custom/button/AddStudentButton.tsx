import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MarronButton from "./MarronButton";

export default function AddStudentButton() {
  const navigate = useNavigate();

  return (
    <MarronButton
      icon={<UserPlus size={18} />}
      label="Enroll New Student"
      onClick={() => navigate("/student-management/create")}
    />
  );
}
