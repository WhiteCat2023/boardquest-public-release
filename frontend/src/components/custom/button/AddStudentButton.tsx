import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import CustomeDrawer from "../drawer/Drawer";
import CustomDialog from "../dialog/Dialog";
import MarronButton from "./MarronButton";

export default function AddStudentButton() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddManual = () => {
    setOpen(false);
    navigate("/student-management/create");
  };

  const handleAddCSV = () => {
    setOpen(false);
    navigate("/student-management/import");
  };

  const options = [
    {
      label: "Enroll New Student",
      onClick: handleAddManual,
    },
    {
      label: "Enroll Students using CSV",
      onClick: handleAddCSV,
      className: "w-full py-6 bg-[#A70202] hover:bg-white hover:text-[#A70202] border border-[#A70202] text-white cursor-pointer font-semibold rounded-xl transition-all duration-150"
    }
  ];

  const triggerButton = (
    <MarronButton
      icon={<UserPlus size={18} />}
      label="Enroll New Student"
      onClick={() => setOpen(true)}
    />
  );

  const title = "Enroll Student";
  const description = "Select how you would like to add new student accounts.";

  const content = (
    <div className="flex flex-col gap-2 w-full mt-2">
      {options.map((option, index) => (
        <MarronButton
          key={index}
          label={option.label}
          onClick={option.onClick}
          className={option.className}
        />
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <CustomeDrawer
        triggerButton={triggerButton}
        title={title}
        description={description}
      >
        {content}
      </CustomeDrawer>
    );
  }

  return (
    <CustomDialog
      triggerButton={triggerButton}
      title={title}
      description={description}
      open={open}
      onOpenChange={setOpen}
    >
      {content}
    </CustomDialog>
  );
}
