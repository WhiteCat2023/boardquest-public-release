import { useState } from "react";
import { PlusCircleIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CustomeDrawer from "./Drawer";

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
    <Button
      variant="outline"
      size="lg"
      className="bg-[#A70202] text-white hover:bg-white hover:text-[#A70202] hover:border-[#A70202] cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-150"
    >
      <PlusCircleIcon size={14} />
      Add Question
    </Button>
  );

  const title = "Add Question";
  const description = "Select how you would like to add a new question to the bank.";

  const content = (
    <div className="flex flex-col gap-2 w-full mt-2">
      <Button 
        className="w-full py-6 bg-[#A70202] hover:bg-white hover:text-[#A70202] border border-[#A70202] text-white cursor-pointer font-semibold rounded-xl transition-all duration-150"
        onClick={handleAddManual}
      >
        Add Question
      </Button>
      <Button 
        className="w-full py-6 bg-[#A70202] hover:bg-white hover:text-[#A70202] border border-[#A70202] text-white cursor-pointer font-semibold rounded-xl transition-all duration-150"
        onClick={handleAddAI}
      >
        Add Question using AI
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <CustomeDrawer
        drawerTriggerIcon={<PlusCircleIcon size={14} />}
        drawerTriggerName={title}
        drawerDescription={description}
        showSwipeHandle={true}
        buttonClassName="bg-[#A70202] text-white hover:bg-white hover:text-[#A70202] hover:border-[#A70202] cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-150"
      >
        {content}
      </CustomeDrawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg font-bold text-gray-800">
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}