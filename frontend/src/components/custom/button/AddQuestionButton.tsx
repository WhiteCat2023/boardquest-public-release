import { useState } from "react";
import { PlusCircleIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import CustomeDrawer from "../drawer/Drawer";
import CustomDialog from "../dialog/Dialog";
import MarronButton from "./MarronButton";

export default function AddQuestionButton() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddManual = () => {
    setOpen(false);
    navigate("/question-bank/create");
  };

  const handleAddAI = () => {
    setOpen(false);
    // Placeholder for AI workflow trigger
  };

  const triggerButton = (
    <MarronButton
      icon={PlusCircleIcon}
      label="Add Question"
      onClick={() => setOpen(true)}
    />
  );

  const title = "Add Question";
  const description = "Select how you would like to add a new question to the bank.";

  const content = (
    <div className="flex flex-col gap-2 w-full mt-2">
      <MarronButton
        label="Add Question"
        onClick={handleAddManual}
      />
      <MarronButton
        label="Add Question using AI"
        onClick={handleAddAI}
        className="w-full py-6 bg-[#A70202] hover:bg-white hover:text-[#A70202] border border-[#A70202] text-white cursor-pointer font-semibold rounded-xl transition-all duration-150"
      />
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