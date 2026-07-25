import { Label } from '../../../../components/ui/label'
import { Textarea } from '../../../../components/ui/textarea'

interface QuestionInputProps {
    questionWording: string;
    setQuestionWording: (value: string) => void;
}

function QuestionInput({ questionWording, setQuestionWording }: QuestionInputProps) {
  return (
    <>
        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Question Wording / Prompt
        </Label>
        <Textarea
            rows={4}
            placeholder="Formulate the complete problem statement or testing prompt. Support Markdown formatting if needed."
            value={questionWording}
            onChange={(e) => setQuestionWording(e.target.value)}
            className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all duration-150 resize-y"
        />
    </>
  )
}

export default QuestionInput