import { Button } from "../../../../../components/ui/button"

interface CardButtonProps {
    title: string;
    description: string;
    selected: boolean;
    onClick: () => void;
}

function CardButton({ title, description, selected, onClick }: CardButtonProps) {
  return (
    <Button
        type="button"
        onClick={onClick}
        variant="outline"
        className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer text-center transition-all duration-200 h-auto whitespace-normal select-none ${
            selected
                ? "bg-[#A70202]/5 border-[#A70202] text-[#A70202] shadow-xs hover:bg-[#A70202]/5 hover:text-[#A70202] hover:border-[#A70202]"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-600"
        }`}
    >
        <span className="text-sm font-extrabold tracking-wide">{title}</span>
        <span className="text-[10px] opacity-70 mt-0.5">{description}</span>
    </Button>
  )
}

export default CardButton;