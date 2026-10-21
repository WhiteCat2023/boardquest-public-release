import { UserPlus, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MarronButton from "./MarronButton";

interface AddFacultyButtonProps {
  activeTab?: "internal" | "external";
}

export default function AddFacultyButton({
  activeTab = "internal",
}: AddFacultyButtonProps) {
  const navigate = useNavigate();
  const isExternal = activeTab === "external";

  return (
    <MarronButton
      icon={isExternal ? <Building2 size={18} /> : <UserPlus size={18} />}
      label={isExternal ? "Add External User" : "Add User"}
      onClick={() =>
        navigate(
          isExternal
            ? "/faculty-management/create?type=external"
            : "/faculty-management/create?type=internal",
        )
      }
    />
  );
}
