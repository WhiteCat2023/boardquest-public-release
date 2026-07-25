import { Input } from "../../../../components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface MultipleChoiceInputProps {
    mcqChoices: string[];
    mcqCorrectIndex: number;
    handleChange: (index: number, value: string) => void;
    setMcqCorrectIndex: (value: number) => void;
    handleAddChoice: () => void;
    handleRemoveChoice?: (index: number) => void;
}

export default function MultipleChoiceInput({ 
    mcqChoices, 
    mcqCorrectIndex, 
    handleChange, 
    setMcqCorrectIndex,
    handleAddChoice,
    handleRemoveChoice
}: MultipleChoiceInputProps) {
    return (
        <div className="flex flex-col gap-3.5">
            <RadioGroup
                value={mcqCorrectIndex.toString()}
                onValueChange={(val) => setMcqCorrectIndex(parseInt(val, 10))}
                className="flex flex-col gap-3.5"
            >
                {mcqChoices.map((choice, index) => {
                    const label = String.fromCharCode(65 + index); // A, B, C, D...
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
                              className="bg-card border-border rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-primary text-foreground text-sm flex-1 placeholder:text-muted-foreground"
                            />

                            {/* Remove Choice Button (if more than 2 options) */}
                            {mcqChoices.length > 2 && handleRemoveChoice && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveChoice(index)}
                                    className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer shrink-0"
                                    title="Remove option"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            )}
                        </div>
                    );
                })}
            </RadioGroup>

            {/* Add Another Choice Button */}
            <div className="pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddChoice}
                    className="w-full sm:w-auto h-10 border-dashed border-border bg-transparent hover:bg-accent text-foreground font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                >
                    <Plus size={15} className="text-primary" />
                    <span>Add Another Choice</span>
                </Button>
            </div>
        </div>
    )
}
