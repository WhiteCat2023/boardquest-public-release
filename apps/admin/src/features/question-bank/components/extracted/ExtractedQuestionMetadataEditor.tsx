import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  return (
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
              Easy
            </SelectItem>
            <SelectItem value="MEDIUM" className="text-xs font-medium">
              Medium
            </SelectItem>
            <SelectItem value="HARD" className="text-xs font-medium">
              Hard
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
  );
}
