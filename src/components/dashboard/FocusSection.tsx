import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAnalyticsComputation } from '@/hooks/useAnalyticsComputation';
import { MetricCard } from './MetricCard';
import {
  gridDefaults,
  yAxisDefaults,
  DarkTooltip,
} from '@/lib/chartDefaults';

function getTopDistractingApps(
  sessions: { app: string; category: string; durationMinutes: number }[],
  limit = 5,
) {
  const countMap = new Map<string, number>();
  for (const s of sessions) {
    countMap.set(s.app, (countMap.get(s.app) ?? 0) + 1);
  }
  return Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function FocusSection() {
  const { t } = useTranslation();
  const analytics = useAnalyticsComputation();

  const topApps = useMemo(() => {
    if (!analytics) return [];
    return getTopDistractingApps(analytics.focusAnalysis.sessions);
  }, [analytics]);

  if (!analytics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#0f1629] border border-[#1c2d4f]" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-[#0f1629] border border-[#1c2d4f]" />
      </div>
    );
  }

  const fa = analytics.focusAnalysis;
  const mostSwitchedCategory = topApps.length > 0 ? topApps[0]!.name : t('common.none');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('focus.metrics.score.title')}
          value={fa.overallScore}
          subtext={t('focus.metrics.score.subtext', { score: fa.fragilityScore })}
          score={fa.overallScore}
          invertScore={true}
        />
        <MetricCard
          title={t('focus.metrics.switches.title')}
          value={fa.totalSwitches}
          subtext={t('focus.metrics.switches.subtext', { count: fa.sessionCount })}
          status="warning"
        />
        <MetricCard
          title={t('focus.metrics.deep.title')}
          value={fa.deepFocusSessionCount}
          subtext={t('focus.metrics.deep.subtext', { time: fa.averageSessionDurationMinutes })}
          status="success"
        />
        <MetricCard
          title={t('focus.metrics.distractor.title')}
          value={mostSwitchedCategory}
          subtext={t('focus.metrics.distractor.subtext')}
          status="neutral"
        />
      </div>

      <div className="rounded-2xl border border-[#1c2d4f] bg-[#0f1629] p-5">
        <h3 className="text-sm font-semibold text-[#f0f4ff] mb-4">{t('focus.chart.title')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topApps} layout="vertical" margin={{ top: 0, right: 16, left: 16, bottom: 0 }}>
            <CartesianGrid {...gridDefaults} />
            <XAxis type="number" stroke="#4a5a7a" fontSize={11} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              {...yAxisDefaults}
              width={100}
              tick={{ fill: '#8899bb', fontSize: 11 }}
            />
            <Tooltip content={DarkTooltip as any} />
            <Bar dataKey="count" fill="#a78bfa" radius={[0, 6, 6, 0]} barSize={16} name={t('focus.chart.series.sessions')} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
