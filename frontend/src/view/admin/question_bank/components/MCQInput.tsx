import { Input } from "../../../../components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface MultipleChoiceInputProps {
    mcqChoices: string[];
    mcqCorrectIndex: number;
    handleChange: (index: number, value: string) => void;
    setMcqCorrectIndex: (value: number) => void;
}

export default function MultipleChoiceInput({ mcqChoices, mcqCorrectIndex, handleChange, setMcqCorrectIndex }: MultipleChoiceInputProps) {
    return (
        <RadioGroup
            value={mcqCorrectIndex.toString()}
            onValueChange={(val) => setMcqCorrectIndex(parseInt(val, 10))}
            className="flex flex-col gap-3.5"
        >
            {mcqChoices.map((choice, index) => {
                const label = String.fromCharCode(65 + index); // A, B, C, D
                return (
                    <div key={index} className="flex items-center gap-3 w-full">
                        <RadioGroupItem
                            value={index.toString()}
                            id={`mcq-option-${index}`}
                            className="w-6 h-6 border-2 border-slate-300 hover:border-slate-400 bg-white data-[state=checked]:border-[#A70202] data-[state=checked]:bg-white data-checked:border-[#A70202] data-checked:bg-white [&>[data-slot=radio-group-indicator]>span]:bg-[#A70202] [&>[data-slot=radio-group-indicator]>span]:size-3 cursor-pointer shrink-0 focus-visible:ring-[#A70202]/30 flex items-center justify-center [&>[data-slot=radio-group-indicator]]:size-full"
                        />
                        
                        {/* Option Wording Input */}
                        <Input
                          type="text"
                          placeholder={`Wording for Option ${label}`}
                          value={choice}
                          onChange={(e) => handleChange(index, e.target.value)}
                          className=" bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm flex-1"
                        />
                    </div>
                );
            })}
        </RadioGroup>
    )
}
