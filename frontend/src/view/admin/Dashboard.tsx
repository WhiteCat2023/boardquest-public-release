import { Button } from "../../components/ui/button";
// import { paraphraseQuestion } from "../../../utils/ParaphraseQuestion";
import type { ParaphraseQuestionProps } from "../../utils/ParaphraseQuestion";
import axios from "axios";
function Dashboard() {

  const questions: ParaphraseQuestionProps = {
    
      question: [
        "What phenomenon occurs when a massive star collapses under its own gravity at the end of its life cycle, resulting in a space-time singularity from which nothing—not even light—can escape?",
        "Which global conflict, lasting from 1939 to 1945, was triggered by the invasion of Poland and resulted in the eventual formation of the United Nations?",
        "What is the chemical formula for hydrogen peroxide, a common household disinfectant and bleaching agent?",
        "Which 16th-century English playwright and poet wrote the famous tragedy Macbeth, as well as sonnets featuring themes of time, love, and beauty?",
        "What is the capital city of Australia, which was chosen as a compromise location between the rival cities of Sydney and Melbourne?",
      ],
  
  };


  async function paraphrase() {
        return await axios.post(
          "http://localhost:5678/webhook/926ceccf-e757-476f-9c04-1234e326cf88",
          [
            {
              prompt: questions.question
            }
          ],
        ).then((response) => {
          console.log("Response from paraphraseQuestion:", response.data);
        });
  }
  return (
    <div className="p-8 w-full">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to the dashboard!</p>
      <Button onClick={() => paraphrase()}>SUBMIT QUESTIONS</Button>
    </div>
  )
}

export default Dashboard