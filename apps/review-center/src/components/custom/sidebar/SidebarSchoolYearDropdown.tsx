import React from "react";
import {
  Calendar,
  ChevronDown,
  Check,
  Plus,
  Settings2,
  GraduationCap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActiveSchoolYear } from "@/context/SchoolYearContext";

export function SidebarSchoolYearDropdown() {
  const {
    activeSchoolYear,
    currentSchoolYear,
    selectSchoolYear,
    schoolYears,
    openCMSModal,
  } = useActiveSchoolYear();

  return (
    <div className="px-2.5 py-1.5 group-data-[collapsible=icon]:p-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-2 p-2 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/80 text-foreground transition-all duration-150 cursor-pointer shadow-2xs group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1.5"
            title={`Active School Year: ${activeSchoolYear}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <Calendar className="size-3.5" />
              </div>
              <div className="flex flex-col text-left min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-[9.5px] font-bold text-muted-foreground/70 tracking-wider uppercase leading-none">
                  School Year
                </span>
                <span className="text-xs font-bold text-foreground truncate mt-0.5 leading-tight flex items-center gap-1.5">
                  <span>{activeSchoolYear}</span>
                  {activeSchoolYear === currentSchoolYear && (
                    <span className="text-[8.5px] font-black uppercase tracking-wider px-1 py-0 rounded bg-primary/15 text-primary border border-primary/20">
                      Current
                    </span>
                  )}
                </span>
              </div>
            </div>

            <ChevronDown className="size-3.5 text-muted-foreground/70 shrink-0 group-data-[collapsible=icon]:hidden transition-transform duration-200" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          side="bottom"
          className="w-56 p-1.5 rounded-xl border border-border bg-card text-card-foreground shadow-xl font-sans"
        >
          <DropdownMenuLabel className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground px-2 py-1">
            School Year Cohorts
          </DropdownMenuLabel>

          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {schoolYears.map((sy) => {
              const isSelected = sy === activeSchoolYear;
              const isCurrent = sy === currentSchoolYear;
              return (
                <DropdownMenuItem
                  key={sy}
                  onSelect={() => selectSchoolYear(sy)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GraduationCap className="size-3.5 text-muted-foreground" />
                    <span className="truncate">{sy}</span>
                    {isCurrent && (
                      <span className="text-[8.5px] font-black uppercase tracking-wider px-1 py-0 rounded bg-primary/15 text-primary border border-primary/20">
                        Current
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator className="my-1 border-border/60" />

          <DropdownMenuItem
            onSelect={() => {
              openCMSModal("create");
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer"
          >
            <Plus className="size-3.5 shrink-0" />
            <span>New School Year</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              openCMSModal("list");
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <Settings2 className="size-3.5 shrink-0" />
            <span>Manage Cohorts (CMS)</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default SidebarSchoolYearDropdown;
