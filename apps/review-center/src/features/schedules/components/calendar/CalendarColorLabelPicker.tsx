import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Pencil, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  GOOGLE_CALENDAR_ROW1,
  GOOGLE_CALENDAR_ROW2,
  getActiveColorHex,
} from "./types";

export interface CalendarColorLabelPickerProps {
  colorKey?: string;
  labels?: string[];
  category?: string;
  disabled?: boolean;
  onChangeColor: (colorKey?: string) => void;
  onChangeLabels: (labels: string[]) => void;
}

export const CalendarColorLabelPicker: React.FC<CalendarColorLabelPickerProps> = ({
  colorKey,
  labels = [],
  category = "Board Review",
  disabled = false,
  onChangeColor,
  onChangeLabels,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const currentLabel = labels && labels.length > 0 ? labels[0] : "";
  const [tempLabel, setTempLabel] = useState(currentLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync temp label when currentLabel changes
  useEffect(() => {
    setTempLabel(currentLabel);
  }, [currentLabel]);

  // When opening edit mode, focus input
  useEffect(() => {
    if (isEditingLabel) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isEditingLabel]);

  // Active color calculation
  const activeHex = getActiveColorHex(category, colorKey);
  const isDefault = !colorKey;

  const handleSaveLabel = () => {
    const trimmed = tempLabel.trim();
    if (trimmed) {
      onChangeLabels([trimmed]);
    } else {
      onChangeLabels([]);
    }
    setIsEditingLabel(false);
  };

  const handleCancelLabel = () => {
    setTempLabel(currentLabel);
    setIsEditingLabel(false);
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setIsEditingLabel(false);
        }
      }}
    >
      {/* Trigger Button - Google Calendar Style [ 🔵 ▼ ] */}
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="h-9 px-2.5 rounded-xl border border-border/80 bg-background hover:bg-muted/60 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs shrink-0"
          title="Select highlight color and label"
          aria-label="Select highlight color and label"
        >
          <span
            className="size-3.5 rounded-full shrink-0 shadow-2xs"
            style={{ backgroundColor: activeHex }}
          />
          <ChevronDown size={12} className="text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>

      {/* Popover Content matching Google Calendar Reference */}
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[295px] sm:w-[315px] p-3 rounded-2xl shadow-xl border border-border/80 bg-popover text-popover-foreground flex flex-col gap-3 font-sans"
      >
        <TooltipProvider delayDuration={150}>
          {/* Header Row: Label Pill + Edit Button */}
          <div className="flex items-center gap-2">
            {!isEditingLabel ? (
              <div className="flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setIsEditingLabel(true)}
                  disabled={disabled}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/90 bg-background text-xs font-medium text-foreground hover:bg-accent/40 transition-colors max-w-[210px] truncate cursor-pointer shadow-2xs"
                  title={currentLabel ? `Label: ${currentLabel}` : "Click to add label"}
                >
                  <span
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: activeHex }}
                  />
                  <span className="truncate">
                    {currentLabel ? (
                      currentLabel
                    ) : (
                      <span className="text-muted-foreground italic font-normal">
                        Add label
                      </span>
                    )}
                  </span>
                </button>

                {/* Edit labels icon button with tooltip */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setIsEditingLabel(true)}
                      disabled={disabled}
                      className="size-7 rounded-full border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                      aria-label="Edit labels"
                    >
                      <Pencil size={12} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>
                    Edit labels
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              /* Inline label editing mode */
              <div className="flex items-center gap-1.5 w-full animate-in fade-in duration-100">
                <span
                  className="size-3 rounded-full shrink-0 ml-1"
                  style={{ backgroundColor: activeHex }}
                />
                <Input
                  ref={inputRef}
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveLabel();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      handleCancelLabel();
                    }
                  }}
                  placeholder="Label name..."
                  className="h-7 text-xs rounded-full px-2.5 py-0 flex-1 border-primary focus-visible:ring-1"
                />
                <button
                  type="button"
                  onClick={handleSaveLabel}
                  className="size-6.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center cursor-pointer shrink-0"
                  title="Save label"
                  aria-label="Save label"
                >
                  <Check size={11} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={handleCancelLabel}
                  className="size-6.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer shrink-0"
                  title="Cancel"
                  aria-label="Cancel"
                >
                  <X size={11} />
                </button>
              </div>
            )}
          </div>

          {/* Color Circles Grid: Row 1 (12 colors) and Row 2 (10 colors) */}
          <div className="flex flex-col gap-2 pt-0.5">
            {/* Row 1 - 12 circles */}
            <div className="grid grid-cols-12 gap-1.5 justify-items-center">
              {GOOGLE_CALENDAR_ROW1.map((swatch) => {
                const isSelected =
                  colorKey === swatch.key ||
                  (colorKey && swatch.colorHex.toLowerCase() === colorKey.toLowerCase());

                return (
                  <button
                    key={swatch.key}
                    type="button"
                    onClick={() => {
                      onChangeColor(swatch.key);
                    }}
                    disabled={disabled}
                    title={swatch.label}
                    aria-label={swatch.label}
                    className="size-4.5 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-115 active:scale-95 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    style={{ backgroundColor: swatch.colorHex }}
                  >
                    {isSelected && (
                      <Check
                        size={10}
                        strokeWidth={3}
                        className="text-white drop-shadow-xs"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Row 2 - 10 circles (left-aligned) */}
            <div className="grid grid-cols-12 gap-1.5 justify-items-center">
              {GOOGLE_CALENDAR_ROW2.map((swatch) => {
                const isSelected =
                  colorKey === swatch.key ||
                  (colorKey && swatch.colorHex.toLowerCase() === colorKey.toLowerCase());

                return (
                  <button
                    key={swatch.key}
                    type="button"
                    onClick={() => {
                      onChangeColor(swatch.key);
                    }}
                    disabled={disabled}
                    title={swatch.label}
                    aria-label={swatch.label}
                    className="size-4.5 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-115 active:scale-95 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    style={{ backgroundColor: swatch.colorHex }}
                  >
                    {isSelected && (
                      <Check
                        size={10}
                        strokeWidth={3}
                        className="text-white drop-shadow-xs"
                      />
                    )}
                  </button>
                );
              })}
              {/* 2 empty spacer cells to maintain grid balance */}
              <div className="col-span-2 pointer-events-none" />
            </div>
          </div>

          {/* Bottom Row: [ 🔘 Default ] Button */}
          <button
            type="button"
            onClick={() => {
              onChangeColor(undefined);
            }}
            disabled={disabled}
            className={`w-full h-8 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
              isDefault
                ? "bg-muted/90 border-border text-foreground font-semibold"
                : "bg-muted/40 hover:bg-muted/70 border-border/60 text-foreground/80 hover:text-foreground"
            }`}
          >
            <span
              className={`size-3.5 rounded-full border-2 shrink-0 ${
                isDefault ? "border-sky-500" : "border-muted-foreground/60"
              }`}
            />
            <span>Default</span>
          </button>
        </TooltipProvider>
      </PopoverContent>
    </Popover>
  );
};

export default CalendarColorLabelPicker;
