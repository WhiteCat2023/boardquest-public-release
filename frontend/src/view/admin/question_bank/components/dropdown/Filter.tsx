import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SlidersHorizontal } from 'lucide-react';
import { useQuestionBankFilterStore } from '@/store/QuestionBankStore';
import { QuestionFilter } from '../QuestionFilter';
import MarronButton from '@/components/custom/button/MarronButton';

function FilterDropdown() {
    const {
        selectedDifficulty,
        selectedType,
        selectedStatus,
    } = useQuestionBankFilterStore();

    const activeFilterCount = [
        selectedDifficulty,
        selectedType,
        selectedStatus,
    ].filter(Boolean).length;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <MarronButton
                    className="h-10 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-150 relative cursor-pointer"
                >
                    <SlidersHorizontal className="size-4" />
                    <span>Filter</span>
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-[#A70202] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {activeFilterCount}
                        </span>
                    )}
                </MarronButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align="end" 
                className="w-80 p-5 bg-white border border-slate-200 shadow-lg rounded-xl z-50"
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