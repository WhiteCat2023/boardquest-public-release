import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomSelectWithLabel from "@/components/custom/select/Select";
import { useCategories } from "@/features/question-bank";
import { useTopics } from "@/features/question-bank/api/useTopics";
import { TopicCMSModal } from "@/features/question-bank/components/dialog/TopicCMSModal";
import { BookOpen, Brain, Check, ChevronDown, Plus, Settings2 } from "lucide-react";
import { getCognitiveLevelMapping } from "@/utils/cognitiveLevel";

interface QuestionMetaFieldsProps {
  categoryId: string;
  onCategoryChange: (val: string) => void;
  topic: string;
  onTopicChange: (val: string) => void;
  difficulty: string;
  onDifficultyChange: (val: string) => void;
}

export function QuestionMetaFields({
  categoryId,
  onCategoryChange,
  topic,
  onTopicChange,
  difficulty,
  onDifficultyChange,
}: QuestionMetaFieldsProps) {
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { data: topics = [], isLoading: isTopicsLoading } = useTopics(categoryId);

  const [isCMSOpen, setIsCMSOpen] = useState(false);
  const [cmsMode, setCmsMode] = useState<"create" | "manage">("manage");

  const selectedCategory = categories.find((c: any) => c.id === categoryId);
  const categoryName = selectedCategory?.name || "Subject";
  const selectedTopicObj = topics.find((t) => t.name === topic);
  const cognitiveInfo = getCognitiveLevelMapping(difficulty || "EASY");

  const handleOpenCMS = (mode: "create" | "manage" = "manage") => {
    setCmsMode(mode);
    setIsCMSOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Category / Subject selection */}
        <div className="flex flex-col gap-1">
          <CustomSelectWithLabel
            label="Subject"
            value={categoryId}
            onValueChange={(val) => {
              onCategoryChange(val);
              // Reset topic when subject changes
              onTopicChange("");
            }}
          >
            {isCategoriesLoading ? (
              <SelectItem value="loading" disabled>
                Loading Subjects...
              </SelectItem>
            ) : categories.length === 0 ? (
              <SelectItem value="none" disabled>
                No Subjects Available
              </SelectItem>
            ) : (
              categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))
            )}
          </CustomSelectWithLabel>
        </div>

        {/* Benchmark Topic */}
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Topic
          </Label>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={!categoryId}
                className="flex w-full h-8 items-center justify-between gap-1.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-muted/30 py-2 pr-2 pl-2.5 text-sm text-slate-700 dark:text-foreground transition-all duration-150 outline-none select-none focus:bg-white dark:focus:bg-card focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-2xs"
                title={topic ? `Selected Topic: ${topic}` : "Select Topic"}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1 text-left">
                  {topic ? (
                    <>
                      <span className="truncate text-sm font-normal text-slate-700 dark:text-foreground">
                        {topic}
                      </span>
                      {selectedTopicObj && (selectedTopicObj.questionCount ?? 0) > 0 && (
                        <span className="text-[8.5px] font-black uppercase tracking-wider px-1 py-0 rounded bg-primary/15 text-primary border border-primary/20 shrink-0">
                          {selectedTopicObj.questionCount} Qs
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground text-sm font-normal truncate">
                      {!categoryId
                        ? "Select Subject first"
                        : isTopicsLoading
                        ? "Loading Topics..."
                        : "Select Topic"}
                    </span>
                  )}
                </div>

                <ChevronDown className="size-4 text-muted-foreground shrink-0 pointer-events-none transition-transform duration-200" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              side="bottom"
              className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[240px] p-1.5 rounded-xl border border-border bg-card text-card-foreground shadow-xl font-sans"
            >
              <DropdownMenuLabel className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground px-2 py-1">
                Available Topics
              </DropdownMenuLabel>

              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {isTopicsLoading ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    Loading topics...
                  </div>
                ) : topics.length === 0 ? (
                  <div className="py-3 px-2 text-center text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">No topics yet</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                      Click &quot;New Topic&quot; below to add one.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Include custom topic if existing or not in list */}
                    {topic && !topics.some((t) => t.name === topic) && (
                      <DropdownMenuItem
                        onSelect={() => onTopicChange(topic)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors bg-primary/10 text-primary font-bold"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <BookOpen className="size-3.5 text-primary shrink-0" />
                          <span className="truncate">{topic}</span>
                        </div>
                        <Check className="size-3.5 text-primary shrink-0 ml-1.5" />
                      </DropdownMenuItem>
                    )}
                    {topics.map((t) => {
                      const isSelected = t.name === topic;
                      return (
                        <DropdownMenuItem
                          key={t.id}
                          onSelect={() => onTopicChange(t.name)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <BookOpen
                              className={`size-3.5 shrink-0 ${
                                isSelected ? "text-primary" : "text-muted-foreground"
                              }`}
                            />
                            <span className="truncate">{t.name}</span>
                            {(t.questionCount ?? 0) > 0 && (
                              <span className="text-[8.5px] font-black uppercase tracking-wider px-1 py-0 rounded bg-primary/15 text-primary border border-primary/20 shrink-0">
                                {t.questionCount} Qs
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="size-3.5 text-primary shrink-0 ml-1.5" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </>
                )}
              </div>

              <DropdownMenuSeparator className="my-1 border-border/60" />

              <DropdownMenuItem
                onSelect={() => handleOpenCMS("create")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer"
              >
                <Plus className="size-3.5 shrink-0" />
                <span>New Topic</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() => handleOpenCMS("manage")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <Settings2 className="size-3.5 shrink-0" />
                <span>Manage Topics (CMS)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Difficulty Level */}
        <div className="flex flex-col gap-1">
          <CustomSelectWithLabel
            label="Difficulty"
            value={difficulty}
            onValueChange={onDifficultyChange}
          >
            <SelectItem value="EASY">Easy Level (LOTS)</SelectItem>
            <SelectItem value="MEDIUM">Medium Level (LOTS / Lower HOTS)</SelectItem>
            <SelectItem value="HARD">Hard Level (HOTS)</SelectItem>
          </CustomSelectWithLabel>
        </div>
      </div>

      {/* Dynamic Cognitive Level & Focus Guidance Banner tied to Difficulty */}
      <div
        className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-all duration-200 shadow-2xs ${cognitiveInfo.badgeClass}`}
      >
        <div className="p-1.5 rounded-lg bg-background/80 shadow-2xs shrink-0 mt-0.5 border border-current/15">
          <Brain className="w-4 h-4 text-current" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-75">
              Primary Cognitive Level:
            </span>
            <span className="font-bold text-xs bg-background/90 px-2 py-0.5 rounded-md border border-current/25 shadow-2xs">
              {cognitiveInfo.label}
            </span>
            <span className="text-[11px] font-medium opacity-80">
              ({cognitiveInfo.fullTitle})
            </span>
          </div>
          <p className="text-xs opacity-95 leading-relaxed">
            <strong className="font-semibold">Typical Focus:</strong>{" "}
            {cognitiveInfo.typicalFocus}
          </p>
        </div>
      </div>

      {/* Topic CMS Modal */}
      {Boolean(categoryId) && (
        <TopicCMSModal
          open={isCMSOpen}
          onOpenChange={setIsCMSOpen}
          categoryId={categoryId}
          categoryName={categoryName}
          selectedTopic={topic}
          initialMode={cmsMode}
          onSelectTopic={(topicName) => onTopicChange(topicName)}
        />
      )}
    </>
  );
}

export default QuestionMetaFields;
