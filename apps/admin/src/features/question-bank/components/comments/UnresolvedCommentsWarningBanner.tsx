import { AlertCircle } from "lucide-react";

interface UnresolvedCommentsWarningBannerProps {
  unresolvedCount: number;
}

export default function UnresolvedCommentsWarningBanner({
  unresolvedCount,
}: UnresolvedCommentsWarningBannerProps) {
  if (unresolvedCount <= 0) return null;

  return (
    <div className="p-3.5 px-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-xs font-medium text-amber-700 dark:text-amber-300">
      <AlertCircle size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
      <span>
        <strong>{unresolvedCount} unresolved comment{unresolvedCount !== 1 ? "s" : ""} remaining.</strong> All comments must be resolved before this question can be resubmitted for review.
      </span>
    </div>
  );
}
