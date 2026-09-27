export interface ReviewCenterCandidateScoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string | null;
  candidateName?: string;
  candidateSchoolId?: string | null;
  reviewCenterId?: string;
}

export const MEDTECH_SUBJECT_WEIGHTS: Record<string, number> = {
  "Clinical Chemistry": 0.2,
  "Microbiology & Parasitology": 0.2,
  "Hematology": 0.2,
  "Immunology & Serology and Immunohematology": 0.2,
  "Clinical Microscopy & Parasitology": 0.1,
  "Histopathology and Medtech Laws": 0.1,
};

export function getCandidateInitials(name?: string): string {
  if (!name) return "ST";
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST"
  );
}

export function getScorePercentageColor(percentage: number | null): string {
  if (percentage === null) return "text-muted-foreground";
  if (percentage >= 75) return "text-emerald-600";
  if (percentage >= 50) return "text-amber-600";
  return "text-destructive";
}
