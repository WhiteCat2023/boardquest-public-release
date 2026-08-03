import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label";

interface TrueOrFalseInputProps {
    tfCorrect: "True" | "False";
    setTfCorrect: (value: "True" | "False") => void;
}

const TOFOptions = [
    {
        value: "True",
        label: "True",
    },
    {
        value: "False",
        label: "False",
    },
] as const

function TrueOrFalseInput({ tfCorrect, setTfCorrect }: TrueOrFalseInputProps) {
    return (
        <RadioGroup
            value={tfCorrect}
            onValueChange={(val) => setTfCorrect(val as "True" | "False")}
            className="flex flex-col gap-3.5"
        >
            {TOFOptions.map((option) => {
                const isSelected = tfCorrect === option.value;
                return (
                    <Label
                        key={option.value}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "bg-[#A70202]/5 border-[#A70202] text-[#A70202] font-semibold"
                            : "bg-card border-border text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground"
                        }`}
                      >
                        <RadioGroupItem
                            value={option.value}
                            id={`tof-${option.value}`}
                            className="w-5 h-5 border-2 border-slate-300 hover:border-slate-400 bg-white data-[state=checked]:border-[#A70202] data-[state=checked]:bg-white data-checked:border-[#A70202] data-checked:bg-white [&>[data-slot=radio-group-indicator]>span]:bg-[#A70202] [&>[data-slot=radio-group-indicator]>span]:size-2.5 cursor-pointer shrink-0 focus-visible:ring-[#A70202]/30 flex items-center justify-center [&>[data-slot=radio-group-indicator]]:size-full"
                        />
                        <span className="text-sm">{option.label}</span>
                    </Label>
                );
            })}
        </RadioGroup>
    )
}

export default TrueOrFalseInput