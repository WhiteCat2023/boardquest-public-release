import React, { useState, useEffect } from "react";
import { Search, Plus, Check, ChevronDown, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LabelComboboxProps {
  value: string;
  onChange: (value: string) => void;
  presetLabels?: string[];
  placeholder?: string;
  className?: string;
}

const DEFAULT_PRESETS = [
  "Mock Board",
  "Diagnostic Exam",
  "Quiz 1",
  "Quiz 2",
  "Quiz 3",
  "Prelim Exam",
  "Midterm Exam",
  "Pre-Board",
  "Subject Grade",
];

export function LabelCombobox({
  value,
  onChange,
  presetLabels = DEFAULT_PRESETS,
  placeholder = "Select or type a custom label...",
  className,
}: LabelComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<string[]>(() => {
    const list = [...presetLabels];
    if (value && !list.includes(value)) {
      list.push(value);
    }
    return list;
  });

  // Keep options synced if value changes from outside
  useEffect(() => {
    if (value && !options.includes(value)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.trim().toLowerCase())
  );

  const isExactMatch = options.some(
    (opt) => opt.toLowerCase() === search.trim().toLowerCase()
  );

  const handleSelect = (label: string) => {
    onChange(label);
    setIsOpen(false);
    setSearch("");
  };

  const handleAddNew = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    if (!options.includes(trimmed)) {
      setOptions((prev) => [...prev, trimmed]);
    }
    onChange(trimmed);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            "w-full justify-between h-9 px-3 rounded-xl border-input bg-card font-semibold text-xs shadow-xs hover:bg-muted/40",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Tag className="size-3.5 text-primary shrink-0" />
            <span
              className={
                value
                  ? "text-foreground font-bold truncate"
                  : "text-muted-foreground font-normal truncate"
              }
            >
              {value || placeholder}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "size-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-2 rounded-2xl shadow-2xl font-sans"
      >
        {/* Search Input */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            autoFocus
            type="text"
            placeholder="Search or type a new label..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!isExactMatch && search.trim()) {
                  handleAddNew();
                } else if (filteredOptions.length > 0) {
                  handleSelect(filteredOptions[0]);
                }
              }
            }}
            className="h-8 pl-8 pr-3 text-xs bg-muted/50 border-border rounded-xl"
          />
        </div>

        {/* Add New Custom Label Option if typed text does not exist */}
        {!isExactMatch && search.trim().length > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleAddNew}
            className="w-full mb-1.5 justify-start gap-2 px-2.5 py-1.5 h-auto text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl border border-primary/20 text-left"
          >
            <Plus className="size-3.5 shrink-0" />
            <span className="truncate">
              Add &ldquo;<strong className="underline">{search.trim()}</strong>&rdquo;
            </span>
          </Button>
        )}

        {/* Options List */}
        <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
          {filteredOptions.length === 0 && isExactMatch ? (
            <div className="py-3 text-center text-xs text-muted-foreground">
              No labels found.
            </div>
          ) : filteredOptions.length === 0 && !search.trim() ? (
            <div className="py-3 text-center text-xs text-muted-foreground">
              No labels available.
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl transition-colors cursor-pointer text-left",
                    isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-foreground hover:bg-accent font-medium"
                  )}
                >
                  <span className="truncate">{opt}</span>
                  {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default LabelCombobox;
