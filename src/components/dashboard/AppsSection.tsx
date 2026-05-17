import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAnalyticsComputation } from '@/hooks/useAnalyticsComputation';
import { useAppStore } from '@/store';
import { categoryColors } from '@/lib/colors';
import { DarkTooltip } from '@/lib/chartDefaults';
import type { AppCategory } from '@/types';
import { useTranslation } from 'react-i18next';

export function AppsSection() {
  const { t } = useTranslation();
  const analytics = useAnalyticsComputation();
  const windowEvents = useAppStore((s) => s.windowEvents);

  const categoryMinutes = useMemo(() => {
    if (!analytics || windowEvents.length === 0) return null;
    
    const map = new Map<AppCategory, number>();
    
    for (const ev of windowEvents) {
      const cat = ev.category;
      map.set(cat, (map.get(cat) ?? 0) + ev.durationMs / 60000);
    }
    
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    
    const data = Array.from(map.entries())
      .map(([name, minutes]) => ({
        name,
        minutes: Math.round(minutes),
        percentage: total > 0 ? ((minutes / total) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.minutes - a.minutes);
      
    return { data, totalMinutes: Math.round(total) };
  }, [analytics, windowEvents]);

  if (!analytics || !categoryMinutes) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-72 rounded-2xl bg-[#0f1629] border border-[#1c2d4f]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-40 rounded-2xl bg-[#0f1629] border border-[#1c2d4f]" />
          <div className="h-40 rounded-2xl bg-[#0f1629] border border-[#1c2d4f]" />
        </div>
      </div>
    );
  }

  const { data, totalMinutes } = categoryMinutes;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#1c2d4f] bg-[#0f1629] p-5">
          <h3 className="text-sm font-semibold text-[#f0f4ff] mb-4">{t('apps.categoryDistribution')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="minutes"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={categoryColors[entry.name as AppCategory] ?? '#6b7280'}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={DarkTooltip as any} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-[#1c2d4f] bg-[#0f1629] p-5">
          <h3 className="text-sm font-semibold text-[#f0f4ff] mb-4">{t('apps.topCategories')}</h3>
          <div className="space-y-3">
            {data.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8899bb]">{cat.name}</span>
                  <span className="text-[#4a5a7a]">{cat.minutes}m ({cat.percentage}%)</span>
                </div>
                <div className="h-2 rounded-full bg-[#1c2d4f] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: categoryColors[cat.name as AppCategory] ?? '#6b7280',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="rounded-2xl border border-[#1c2d4f] bg-[#0f1629] p-4 text-center">
        <span className="text-sm text-[#8899bb]">
          {t('apps.totalTracked')}: <span className="text-[#f0f4ff] font-semibold">{totalMinutes}m</span> {t('apps.across')} {windowEvents.length} {t('apps.events')}
        </span>
      </div>
    </div>
  );
}
