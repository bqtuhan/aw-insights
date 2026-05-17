import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAnalyticsComputation } from '@/hooks/useAnalyticsComputation';
import { BurnoutPredictor } from '@/modules/burnout/BurnoutPredictor';
import { MetricCard } from './MetricCard';
import type { DailySummary } from '@/types';
import {
  gridDefaults,
  xAxisDefaults,
  yAxisDefaults,
  DarkTooltip,
} from '@/lib/chartDefaults';

const burnoutPredictor = new BurnoutPredictor();

function buildProgressiveBurnout(dailyAggregates: DailySummary[]) {
  if (dailyAggregates.length === 0) return [];

  const sorted = [...dailyAggregates].sort((a, b) => a.date.localeCompare(b.date));
  const result: { date: string; productiveMinutes: number; burnoutScore: number }[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const slice = sorted.slice(0, i + 1);
    const analysis = burnoutPredictor.analyze(slice);
    result.push({
      date: sorted[i]!.date,
      productiveMinutes: sorted[i]!.productiveMinutes,
      burnoutScore: analysis.burnoutScore,
    });
  }

  return result;
}

export function OverviewSection() {
  const { t } = useTranslation();
  const analytics = useAnalyticsComputation();

  const chartData = useMemo(() => {
    if (!analytics) return null;
    return buildProgressiveBurnout(analytics.timelineAnalysis.dailyAggregates);
  }, [analytics]);

  if (!analytics || !chartData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#0f1629] border border-[#1c2d4f]" />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-[#0f1629] border border-[#1c2d4f]" />
      </div>
    );
  }

  const { focusAnalysis, flowAnalysis, burnoutAnalysis, timelineAnalysis } = analytics;
  
  const totalTrackedMinutes = timelineAnalysis.dailyAggregates.reduce(
    (acc, d) => acc + d.totalMinutes,
    0,
  );
  
  const totalDays = timelineAnalysis.dailyAggregates.filter(
    (d) => d.totalMinutes > 0
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('overview.metrics.focus.title')}
          value={focusAnalysis.overallScore}
          subtext={t('overview.metrics.focus.subtext', { 
            switches: focusAnalysis.totalSwitches, 
            sessions: focusAnalysis.deepFocusSessionCount 
          })}
          score={focusAnalysis.overallScore}
          invertScore={true}
        />
        <MetricCard
          title={t('overview.metrics.flow.title')}
          value={`${Math.round(flowAnalysis.totalFlowMinutes)}m`}
          subtext={t('overview.metrics.flow.subtext', { 
            percent: (flowAnalysis.flowRatio * 100).toFixed(0) 
          })}
          status="success"
        />
        <MetricCard
          title={t('overview.metrics.burnout.title')}
          value={burnoutAnalysis.burnoutScore}
          subtext={t(`burnout.riskLevels.${burnoutAnalysis.riskLevel.toLowerCase()}`).toUpperCase()}
          score={burnoutAnalysis.burnoutScore}
          invertScore={false}
        />
        <MetricCard
          title={t('overview.metrics.tracked.title')}
          value={`${Math.round(totalTrackedMinutes / 60)}h`}
          subtext={t('overview.metrics.tracked.subtext', { days: totalDays })}
          status="neutral"
        />
      </div>

      <div className="rounded-2xl border border-[#1c2d4f] bg-[#0f1629] p-5">
        <h3 className="text-sm font-semibold text-[#f0f4ff] mb-4">
          {t('overview.chart.title')}
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...gridDefaults} />
            <XAxis
              {...xAxisDefaults}
              dataKey="date"
              tickFormatter={(val: string) => {
                const d = new Date(val);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis
              yAxisId="left"
              {...yAxisDefaults}
              label={{
                value: t('overview.chart.yLeft'),
                angle: -90,
                position: 'insideLeft',
                fill: '#8899bb',
                fontSize: 11,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              {...yAxisDefaults}
              domain={[0, 100]}
              label={{
                value: t('overview.chart.yRight'),
                angle: 90,
                position: 'insideRight',
                fill: '#f43f5e',
                fontSize: 11,
              }}
            />
            <Tooltip content={DarkTooltip as any} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="productiveMinutes"
              stroke="#00d4ff"
              fill="url(#cyanGradient)"
              strokeWidth={2}
              name={t('overview.chart.series.productive')}
            />
            <defs>
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="burnoutScore"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={false}
              name={t('overview.chart.series.burnout')}
              strokeDasharray="4 4"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
