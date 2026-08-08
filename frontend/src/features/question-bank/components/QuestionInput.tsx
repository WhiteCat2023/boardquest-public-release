import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface QuestionInputProps {
    questionWording: string;
    setQuestionWording: (value: string) => void;
}

function QuestionInput({ questionWording, setQuestionWording }: QuestionInputProps) {
  return (
    <div className="flex flex-col gap-1">
        <Label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
            Question Wording / Prompt
        </Label>
        <Textarea
            rows={2}
            placeholder="Formulate the complete problem statement or testing prompt."
            value={questionWording}
            onChange={(e) => setQuestionWording(e.target.value)}
            className="w-full p-2.5 px-3 text-xs bg-muted/40 border border-border rounded-lg focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all duration-150 resize-y leading-normal min-h-[64px]"
        />
    </div>
  )
}

export default QuestionInput;