import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SlidersHorizontal } from 'lucide-react';
import { useQuestionBankFilterStore } from '@/store/QuestionBankStore';
import { QuestionFilter } from '../QuestionFilter';
import { Button } from '@/components/ui/button';

function FilterDropdown() {
    const {
        selectedDifficulty,
        selectedType,
    } = useQuestionBankFilterStore();

    const activeFilterCount = [
        selectedDifficulty,
        selectedType,
    ].filter(Boolean).length;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="h-10 border-border bg-card hover:bg-accent text-foreground font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-150 relative cursor-pointer"
                >
                    <SlidersHorizontal className="size-4" />
                    <span>Filter</span>
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-xs">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align="end" 
                className="w-80 p-5 bg-popover text-popover-foreground border border-border shadow-xl rounded-2xl z-50"
                onPointerDownOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target?.closest('[data-radix-popper-content-wrapper]') || target?.closest('[role="listbox"]')) {
                        e.preventDefault();
                    }
                }}
            >
                <QuestionFilter showSearch={false} />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default FilterDropdown