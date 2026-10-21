import React, { useState, useEffect } from "react";
import { ListFilter, X, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ColumnFilterOption {
  label: React.ReactNode;
  value: string;
  icon?: React.ReactNode;
}

export interface ColumnHeaderFilterProps {
  title: string;
  options: ColumnFilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  align?: "start" | "center" | "end";
  className?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

export function ColumnHeaderFilter({
  title,
  options,
  selectedValue,
  onSelect,
  align = "start",
  className,
  showAllOption = true,
  allOptionLabel = "All",
}: ColumnHeaderFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState(selectedValue || "ALL");

  const isActive = Boolean(
    selectedValue && selectedValue !== "ALL" && selectedValue !== ""
  );

  // Sync temp state whenever popover opens
  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedValue || "ALL");
    }
  }, [isOpen, selectedValue]);

  const handleApply = () => {
    onSelect(tempSelected);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempSelected("ALL");
    onSelect("ALL");
    setIsOpen(false);
  };

  const handleToggleOption = (val: string) => {
    if (val === "ALL") {
      setTempSelected("ALL");
      return;
    }

    if (tempSelected === val) {
      // Uncheck reverts to ALL
      setTempSelected("ALL");
    } else {
      setTempSelected(val);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 font-extrabold uppercase tracking-wider transition-colors cursor-pointer group text-inherit select-none text-left",
            isActive && "text-primary",
            className
          )}
          title={`Filter by ${title}${isActive ? ` (${selectedValue})` : ""}`}
        >
          <span className="truncate">{title}</span>
          <span
            className={cn(
              "p-0.5 rounded transition-colors inline-flex items-center justify-center",
              isActive
                ? "text-primary bg-primary/10"
                : "text-muted-foreground/60 group-hover:text-foreground"
            )}
          >
            <ListFilter
              size={13}
              className={cn(
                "transition-transform",
                isActive && "scale-105"
              )}
            />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        sideOffset={6}
        className="w-52 p-0 rounded-xl shadow-xl border border-border bg-card overflow-hidden font-sans normal-case tracking-normal"
      >
        {/* Header Title */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/80 bg-muted/20">
          <span className="text-xs font-semibold text-foreground">
            Filter {title}
          </span>
          {tempSelected !== "ALL" && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Options List with Checkboxes */}
        <div className="p-1.5 max-h-60 overflow-y-auto space-y-0.5">
          {showAllOption && (
            <div
              onClick={() => handleToggleOption("ALL")}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors",
                tempSelected === "ALL"
                  ? "bg-accent/60 text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Checkbox
                checked={tempSelected === "ALL"}
                onCheckedChange={() => handleToggleOption("ALL")}
                className="size-3.5 rounded"
              />
              <span className="truncate">{allOptionLabel}</span>
            </div>
          )}

          {options.map((opt) => {
            const isChecked = tempSelected === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => handleToggleOption(opt.value)}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors",
                  isChecked
                    ? "bg-accent/60 text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleToggleOption(opt.value)}
                  className="size-3.5 rounded"
                />
                <div className="flex items-center gap-1.5 truncate">
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="p-2 border-t border-border/80 bg-muted/10 flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            className="w-full h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-xs cursor-pointer"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ColumnHeaderFilter;
