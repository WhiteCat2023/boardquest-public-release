import { Button } from "@/components/ui/button"

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
        className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer text-center transition-all duration-150 h-auto whitespace-normal select-none ${
            selected
                ? "bg-primary/10 border-primary text-primary shadow-2xs font-bold"
                : "bg-card border-border/80 text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground"
        }`}
    >
        <span className="text-xs font-bold tracking-wide">{title}</span>
        <span className="text-[9px] opacity-75 mt-0.5 font-medium">{description}</span>
    </Button>
  )
}

export default CardButton;