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
        <div className="flex flex-col gap-2.5">
            <RadioGroup
                value={mcqCorrectIndex.toString()}
                onValueChange={(val) => setMcqCorrectIndex(parseInt(val, 10))}
                className="flex flex-col gap-2.5"
            >
                {mcqChoices.map((choice, index) => {
                    const label = String.fromCharCode(65 + index); // A, B, C, D...
                    return (
                        <div key={index} className="flex items-center gap-2.5 w-full">
                            <RadioGroupItem
                                value={index.toString()}
                                id={`mcq-option-${index}`}
                                className="w-5 h-5 border-2 border-border hover:border-primary bg-card data-[state=checked]:border-primary data-[state=checked]:bg-card cursor-pointer shrink-0 focus-visible:ring-ring/20 flex items-center justify-center"
                            />
                            
                            {/* Option Wording Input */}
                            <Input
                              type="text"
                              placeholder={`Wording for Option ${label}`}
                              value={choice}
                              onChange={(e) => handleChange(index, e.target.value)}
                              className="bg-card border-border rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-primary text-foreground text-xs h-9 flex-1 placeholder:text-muted-foreground"
                            />

                            {/* Remove Choice Button (if more than 2 options) */}
                            {mcqChoices.length > 2 && handleRemoveChoice && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveChoice(index)}
                                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer shrink-0"
                                    title="Remove option"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            )}
                        </div>
                    );
                })}
            </RadioGroup>

            {/* Add Another Choice Button */}
            <div className="pt-1">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddChoice}
                    className="w-full sm:w-auto h-8 border-dashed border-border bg-transparent hover:bg-accent text-foreground font-semibold px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs"
                >
                    <Plus size={13} className="text-primary" />
                    <span>Add Another Choice</span>
                </Button>
            </div>
        </div>
    )
}
