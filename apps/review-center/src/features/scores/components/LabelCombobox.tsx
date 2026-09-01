import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, Check, ChevronDown, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus search input on open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-input bg-card hover:bg-muted/40 transition-colors shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring cursor-pointer h-9"
      >
        <div className="flex items-center gap-2 truncate">
          <Tag className="size-3.5 text-primary shrink-0" />
          <span className={value ? "text-foreground font-bold truncate" : "text-muted-foreground truncate"}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-2xl border border-border bg-card shadow-2xl p-2 text-card-foreground animate-in fade-in-0 zoom-in-95 duration-100 font-sans">
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <input
              ref={searchInputRef}
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
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-xl outline-hidden focus:border-primary focus:bg-background transition-all font-medium"
            />
          </div>

          {/* Add New Custom Label Option if typed text does not exist */}
          {!isExactMatch && search.trim().length > 0 && (
            <button
              type="button"
              onClick={handleAddNew}
              className="w-full mb-1.5 flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors cursor-pointer border border-primary/20 text-left"
            >
              <Plus className="size-3.5 shrink-0" />
              <span className="truncate">
                Add &ldquo;<strong className="underline">{search.trim()}</strong>&rdquo;
              </span>
            </button>
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
        </div>
      )}
    </div>
  );
}
