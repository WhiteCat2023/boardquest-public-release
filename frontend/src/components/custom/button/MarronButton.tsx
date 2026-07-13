import { Button } from "../../ui/button"
import { type LucideIcon } from "lucide-react";

interface MarronButtonProps {
    icon?: LucideIcon;
    label?: string;
    onClick?: () => void;
    className?: string;
}

export default function MarronButton({ icon:Icon, label, onClick, className }: MarronButtonProps) {
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      className={`${className} bg-[#A70202] text-white hover:bg-white hover:text-[#A70202] hover:border-[#A70202] cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-150`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </Button>
  )
}