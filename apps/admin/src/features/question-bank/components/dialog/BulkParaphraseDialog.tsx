import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  type ParaphraseTone,
  type BulkParaphraseDialogProps,
  useBulkParaphrase,
  ParaphraseHeader,
  ParaphraseToolbar,
  ParaphraseQuestionCard,
  ParaphraseDialogFooter,
} from "./paraphrase";

export type { ParaphraseTone };

export default function BulkParaphraseDialog({
  open,
  onOpenChange,
  selectedQuestions,
  onSuccess,
  onApplyToForm,
}: BulkParaphraseDialogProps) {
  const {
    tone,
    setTone,
    items,
    isBulkLoading,
    isSaving,
    changedCount,
    revertedCount,
    triggerBulkParaphrase,
    handleSingleReParaphrase,
    handleRevertSingle,
    handleRevertAll,
    handleSelectAlternative,
    handleManualEdit,
    handleApplyChanges,
  } = useBulkParaphrase({
    open,
    onOpenChange,
    selectedQuestions,
    onSuccess,
    onApplyToForm,
  });

  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(
    {}
  );

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] sm:max-w-4xl lg:max-w-5xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden font-sans border-border bg-card shadow-2xl rounded-2xl">
        {/* Compact Header */}
        <ParaphraseHeader
          itemsCount={items.length}
          changedCount={changedCount}
          revertedCount={revertedCount}
        />

        {/* Compact Controls Toolbar */}
        <ParaphraseToolbar
          tone={tone}
          onToneChange={(newTone) => {
            setTone(newTone);
            triggerBulkParaphrase(items, newTone);
          }}
          onReParaphraseAll={() => triggerBulkParaphrase(items, tone)}
          onRevertAll={handleRevertAll}
          isBulkLoading={isBulkLoading}
          isAllReverted={revertedCount === items.length}
        />

        {/* Scrollable Questions Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 md:p-5 space-y-3 bg-muted/10">
          {items.map((item, index) => (
            <ParaphraseQuestionCard
              key={item.id}
              item={item}
              index={index}
              isBulkLoading={isBulkLoading}
              isAccordionOpen={Boolean(openAccordions[item.id])}
              onToggleAccordion={() => toggleAccordion(item.id)}
              onSingleReParaphrase={handleSingleReParaphrase}
              onRevertSingle={handleRevertSingle}
              onManualEdit={handleManualEdit}
              onSelectAlternative={handleSelectAlternative}
            />
          ))}
        </div>

        {/* Compact Professional Footer */}
        <ParaphraseDialogFooter
          changedCount={changedCount}
          isSaving={isSaving}
          isBulkLoading={isBulkLoading}
          hasApplyToForm={Boolean(onApplyToForm)}
          onClose={() => onOpenChange(false)}
          onApply={handleApplyChanges}
        />
      </DialogContent>
    </Dialog>
  );
}
