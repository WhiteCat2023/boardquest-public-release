import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CustomSelectWithLabelProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}
export default function CustomSelectWithLabel ({label, value, onValueChange, children, className}: CustomSelectWithLabelProps) {
  return (
    <>
    <Label className={`text-[11px] font-bold text-slate-500 uppercase tracking-wider ${className}`}>
      {label}
    </Label>
    <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm text-slate-700 transition-all duration-150">
            <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent position="popper">
            {children}
        </SelectContent>
    </Select>
    </>
  )
}