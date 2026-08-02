import { PlusCircleIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import MarronButton from "./MarronButton";

export default function AddQuestionButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddQuestion = () => {
    navigate("/question-bank/create", { state: { from: location } });
  };

  return (
    <MarronButton
      icon={<PlusCircleIcon />}
      label="Add Question"
      onClick={handleAddQuestion}
    />
  );
}