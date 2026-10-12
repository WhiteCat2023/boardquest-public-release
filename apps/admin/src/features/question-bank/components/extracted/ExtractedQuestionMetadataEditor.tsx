import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain } from "lucide-react";
import { getCognitiveLevelMapping } from "@/utils/cognitiveLevel";

interface ExtractedQuestionMetadataEditorProps {
  type: string;
  difficulty: string;
  topic: string;
  onTypeChange: (newType: string) => void;
  onDifficultyChange: (newDifficulty: string) => void;
  onTopicChange: (newTopic: string) => void;
}

export default function ExtractedQuestionMetadataEditor({
  type,
  difficulty,
  topic,
  onTypeChange,
  onDifficultyChange,
  onTopicChange,
}: ExtractedQuestionMetadataEditorProps) {
  const cognitiveInfo = getCognitiveLevelMapping(difficulty || "EASY");

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-start">
        {/* Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Question Type
          </label>
          <Select value={type || "MCQ"} onValueChange={onTypeChange}>
            <SelectTrigger className="h-8 text-xs bg-background w-full">
              <SelectValue placeholder="Question Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MCQ" className="text-xs font-medium">
                Multiple Choice (MCQ)
              </SelectItem>
              <SelectItem value="TRUE_FALSE" className="text-xs font-medium">
                True / False
              </SelectItem>
              <SelectItem value="SHORT_ANSWER" className="text-xs font-medium">
                Short Answer / Identification
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Difficulty Level
          </label>
          <Select
            value={difficulty || "MEDIUM"}
            onValueChange={onDifficultyChange}
          >
            <SelectTrigger className="h-8 text-xs bg-background w-full">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EASY" className="text-xs font-medium">
                Easy Level (LOTS)
              </SelectItem>
              <SelectItem value="MEDIUM" className="text-xs font-medium">
                Medium Level (LOTS / Lower HOTS)
              </SelectItem>
              <SelectItem value="HARD" className="text-xs font-medium">
                Hard Level (HOTS)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Topic / Subject */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Topic / Subject
          </label>
          <Input
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="e.g. Fixatives, Physical Urinalysis"
            className="h-8 text-xs bg-background w-full"
          />
        </div>
      </div>

      {/* Dynamic Cognitive Level & Focus Guidance Banner tied to Difficulty */}
      <div
        className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-all duration-200 shadow-2xs ${cognitiveInfo.badgeClass}`}
      >
        <div className="p-1 rounded bg-background/80 shrink-0 mt-0.5 border border-current/15">
          <Brain className="w-3.5 h-3.5 text-current" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-75">
              Primary Cognitive Level:
            </span>
            <span className="font-bold text-[11px] bg-background/90 px-1.5 py-0.2 rounded border border-current/25">
              {cognitiveInfo.label}
            </span>
            <span className="text-[10px] opacity-80">
              ({cognitiveInfo.fullTitle})
            </span>
          </div>
          <p className="text-[11px] opacity-95 mt-0.5 leading-relaxed">
            <strong className="font-semibold">Typical Focus:</strong>{" "}
            {cognitiveInfo.typicalFocus}
          </p>
        </div>
      </div>
    </div>
  );
}
