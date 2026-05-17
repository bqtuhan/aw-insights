import { useMemo, useState } from 'react';
import { useAnalyticsComputation } from '@/hooks/useAnalyticsComputation';
import { useTranslation } from 'react-i18next';

type HeatmapEntry = { date: string; value: number; level: number };

function getColor(level: number): string {
  switch (level) {
    case 0: return '#1c2d4f';
    case 1: return 'rgba(0, 212, 255, 0.2)';
    case 2: return 'rgba(0, 212, 255, 0.4)';
    case 3: return 'rgba(167, 139, 250, 0.6)';
    case 4: return '#00d4ff';
    default: return '#1c2d4f';
  }
}

function buildRigidCalendarMatrix(data: HeatmapEntry[]) {
  if (data.length === 0) return [];
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  
  const weeks: (HeatmapEntry | null)[][] = [];
  let currentWeek: (HeatmapEntry | null)[] = Array(7).fill(null);

  for (const entry of sorted) {
    const date = new Date(entry.date);
    const dayIndex = date.getDay();

    currentWeek[dayIndex] = entry;

    if (dayIndex === 6) {
      weeks.push(currentWeek);
      currentWeek = Array(7).fill(null);
    }
  }

  if (currentWeek.some(d => d !== null)) {
    weeks.push(currentWeek);
  }

  return weeks;
}

export function TimelineSection() {
  const { t } = useTranslation();
  const analytics = useAnalyticsComputation();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; value: number } | null>(null);

  const weeks = useMemo(() => {
    if (!analytics) return null;
    return buildRigidCalendarMatrix(analytics.timelineAnalysis.heatmapData);
  }, [analytics]);

  if (!analytics || !weeks) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-2xl bg-[#0f1629] border border-[#1c2d4f]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#1c2d4f] bg-[#0f1629] p-5 relative">
        <h3 className="text-sm font-semibold text-[#f0f4ff] mb-4">{t('timeline.activityHeatmap')}</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-1" style={{ minWidth: weeks.length * 14 }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => {
                  if (!day) {
                    return <div key={di} className="w-4 h-4 rounded-sm bg-transparent pointer-events-none" />;
                  }
                  return (
                    <div
                      key={di}
                      className="w-4 h-4 rounded-sm cursor-pointer transition-transform hover:scale-125"
                      style={{ backgroundColor: getColor(day.level) }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          x: rect.left + 8,
                          y: rect.top - 35,
                          date: day.date,
                          value: day.value,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 mt-4 text-[11px] text-[#4a5a7a]">
          <span>{t('timeline.less')}</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <div key={lvl} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(lvl) }} />
          ))}
          <span>{t('timeline.more')}</span>
        </div>
        
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none rounded-lg border border-[#243a65] bg-[#172035] px-3 py-2 text-xs shadow-lg transition-all"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <p className="text-[#f0f4ff] font-medium">{tooltip.date}</p>
            <p className="text-[#8899bb]">{tooltip.value} {t('timeline.productiveMin')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
