import { cn } from '@/lib/utils';

type MetricStatus = 'success' | 'warning' | 'danger' | 'neutral';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  score?: number;
  status?: MetricStatus;
  invertScore?: boolean;
}

const statusColors: Record<MetricStatus, { border: string; text: string; glow: string }> = {
  success: {
    border: 'border-[#10b981]/30',
    text: 'text-[#10b981]',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.08)]',
  },
  warning: {
    border: 'border-[#f59e0b]/30',
    text: 'text-[#f59e0b]',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.08)]',
  },
  danger: {
    border: 'border-[#f43f5e]/30',
    text: 'text-[#f43f5e]',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.08)]',
  },
  neutral: {
    border: 'border-[#1c2d4f]',
    text: 'text-[#f0f4ff]',
    glow: '',
  },
};

function deriveStatus(score: number, invertScore: boolean): MetricStatus {
  if (invertScore) {
    if (score >= 75) return 'success';
    if (score >= 45) return 'warning';
    return 'danger';
  } else {
    if (score <= 40) return 'success';
    if (score <= 70) return 'warning';
    return 'danger';
  }
}

export function MetricCard({ title, value, subtext, score, status, invertScore = false }: MetricCardProps) {
  const resolvedStatus = status ?? (score !== undefined ? deriveStatus(score, invertScore) : 'neutral');
  const colors = statusColors[resolvedStatus];

  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-[#0f1629] p-5 transition-all duration-300 hover:scale-[1.02]',
        colors.border,
        colors.glow,
      )}
    >
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-widest text-[#4a5a7a]">
          {title}
        </span>
        <span className={cn('text-3xl font-bold tracking-tight', colors.text)}>
          {value}
        </span>
        <span className="text-xs text-[#8899bb]">{subtext}</span>
      </div>
      {resolvedStatus !== 'neutral' && (
        <div
          className={cn(
            'absolute top-3 right-3 h-2 w-2 rounded-full',
            resolvedStatus === 'success' && 'bg-[#10b981] shadow-[0_0_6px_#10b981]',
            resolvedStatus === 'warning' && 'bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]',
            resolvedStatus === 'danger' && 'bg-[#f43f5e] shadow-[0_0_6px_#f43f5e]',
          )}
        />
      )}
    </div>
  );
}
