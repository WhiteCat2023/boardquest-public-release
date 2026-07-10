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
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'pending review':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'needs revision':
        return 'border-rose-200 bg-rose-50 text-rose-700';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-700';
    }
  };

  // Difficulty colors mapping
  export const getDifficultyColor = (diff?: string) => {
    switch ((diff || '').toLowerCase()) {
      case 'easy':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'medium':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'hard':
        return 'border-rose-200 bg-rose-50 text-rose-700';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-600';
    }
  };