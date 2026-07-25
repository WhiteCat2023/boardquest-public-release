// Helper to get initials
export const getInitials = (name?: string) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Status colors mapping
export const getStatusColor = (status?: string) => {
  switch ((status || '').toLowerCase().replace(/_/g, ' ')) {
    case 'approved':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'pending review':
    case 'pending':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'needs revision':
      return 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400';
    default:
      return 'border-border bg-muted text-muted-foreground';
  }
};

// Difficulty colors mapping
export const getDifficultyColor = (diff?: string) => {
  switch ((diff || '').toLowerCase()) {
    case 'easy':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'medium':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'hard':
      return 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400';
    default:
      return 'border-border bg-muted text-muted-foreground';
  }
};