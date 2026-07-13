import { Textarea } from "@/components/ui/textarea";
import { Label } from '../../../../components/ui/label';
import { FileText } from 'lucide-react';

interface ShortAnswerInputProps {
    saCorrectAnswer: string;
    setSaCorrectAnswer: (value: string) => void;
}

function ShortAnswerInput({ saCorrectAnswer, setSaCorrectAnswer }: ShortAnswerInputProps) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Correct Answer Wording
            </Label>
            <div className="flex items-start gap-2">
                <FileText size={16} className="text-slate-400 shrink-0 mt-3" />
                <Textarea
                    placeholder="Type the exact expected answer text..."
                    value={saCorrectAnswer}
                    onChange={(e) => setSaCorrectAnswer(e.target.value)}
                    rows={3}
                    className="min-h-[80px] bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm flex-1 resize-y"
                />
            </div>
        </div>
    )
}

export default ShortAnswerInput