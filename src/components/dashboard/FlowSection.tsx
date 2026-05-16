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

export function FlowSection() {
  const analytics = useAnalyticsComputation();

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

  const fl = analytics.flowAnalysis;
  const peakHourLabel = fl.peakHours.length > 0 ? `${fl.peakHours[0]!.hour}:00` : 'N/A';

  const chartData = [...fl.peakHours].sort((a, b) => a.hour - b.hour);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Flow"
          value={`${Math.round(fl.totalFlowMinutes)}m`}
          subtext={`${fl.flowSessionCount} flow sessions`}
          status="success"
        />
        <MetricCard
          title="Flow Ratio"
          value={`${(fl.flowRatio * 100).toFixed(0)}%`}
          subtext="of productive time"
          status="success"
        />
        <MetricCard
          title="Avg Block"
          value={`${fl.averageFlowDurationMinutes}m`}
          subtext="per flow session"
          status="neutral"
        />
        <MetricCard
          title="Peak Hour"
          value={peakHourLabel}
          subtext="most flow minutes"
          status="neutral"
        />
      </div>

      <div className="rounded-2xl border border-[#1c2d4f] bg-[#0f1629] p-5">
        <h3 className="text-sm font-semibold text-[#f0f4ff] mb-4">Top Intensity Windows (Peak Hours)</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridDefaults} />
              <XAxis dataKey="hour" stroke="#4a5a7a" fontSize={11} tickFormatter={(h: number) => `${h}:00`} />
              <YAxis {...yAxisDefaults} />
              <Tooltip content={DarkTooltip} />
              <Bar dataKey="minutes" fill="#00d4ff" radius={[6, 6, 0, 0]} barSize={40} name="Flow minutes" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-[#4a5a7a]">
            No profound flow blocks captured to compute peak windows.
          </div>
        )}
      </div>
    </div>
  );
}
