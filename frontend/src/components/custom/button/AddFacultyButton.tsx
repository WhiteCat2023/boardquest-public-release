import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MarronButton from "./MarronButton";

export default function AddFacultyButton() {
  const navigate = useNavigate();

  return (
    <MarronButton
      icon={<UserPlus size={18} />}
      label="Add Faculty Member"
      onClick={() => navigate("/faculty-management/create")}
    />
  );
}
