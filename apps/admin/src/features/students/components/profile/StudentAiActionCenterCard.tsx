import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  type StudentAiActionCenterCardProps,
  type InsightFilter,
  computeStrengthsAndGaps,
  AiActionCenterHeader,
  AiActionCenterFilterNav,
  AiStrengthsSection,
  AiWeaknessesSection,
  AiSuggestionsSection,
  AiActionCenterFooter,
} from "./ai-action-center";

export type { StudentAiActionCenterCardProps };

export function StudentAiActionCenterCard({
  student,
  report,
  onAssignGuidance,
  onOpenScorecard,
}: StudentAiActionCenterCardProps) {
  const [activeTab, setActiveTab] = useState<InsightFilter>("all");

  const {
    primaryStrength,
    primaryGap,
    secondaryGap,
    targetBatch,
    dailyQuota,
    daysRemaining,
    streak,
  } = computeStrengthsAndGaps(student);

  return (
    <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs flex flex-col">
      {/* Radiant Gradient Header with Glow */}
      <AiActionCenterHeader />

      {/* Filter / Focus Navigation Bar */}
      <AiActionCenterFilterNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* SECTION 1: STRENGTHS */}
          {(activeTab === "all" || activeTab === "strengths") && (
            <AiStrengthsSection
              primaryStrength={primaryStrength}
              streak={streak}
            />
          )}

          {/* SECTION 2: GAPS & WEAKNESSES */}
          {(activeTab === "all" || activeTab === "gaps") && (
            <AiWeaknessesSection
              primaryGap={primaryGap}
              secondaryGap={secondaryGap}
            />
          )}

          {/* SECTION 3: SUGGESTIONS FOR IMPROVEMENT */}
          {(activeTab === "all" || activeTab === "suggestions") && (
            <AiSuggestionsSection
              primaryGap={primaryGap}
              dailyQuota={dailyQuota}
              daysRemaining={daysRemaining}
              targetBatch={targetBatch}
              onAssignGuidance={onAssignGuidance}
            />
          )}
        </div>

        {/* Expected Overall Outcome Banner & Quick Action Buttons */}
        <AiActionCenterFooter
          onAssignGuidance={onAssignGuidance}
          onOpenScorecard={onOpenScorecard}
        />
      </div>
    </Card>
  );
}

export { StudentAiActionCenterCard as StudentAiInsightsCard };
export default StudentAiActionCenterCard;
