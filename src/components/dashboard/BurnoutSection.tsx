import { useAnalyticsComputation } from '@/hooks/useAnalyticsComputation';
import { useTranslation } from 'react-i18next';

function FactorBar({
  label,
  weight,
  score,
}: {
  label: string;
  weight: string;
  score: number;
}) {
  const color = score >= 70 ? '#f43f5e' : score >= 40 ? '#f59e0b' : '#10b981';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#8899bb]">{label}</span>
        <span className="text-[#4a5a7a]">{weight}</span>
      </div>
      <div className="h-2 rounded-full bg-[#1c2d4f] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-[11px] text-[#8899bb]">{score}/100</div>
    </div>
  );
}

export function BurnoutSection() {
  const { t } = useTranslation();
  const analytics = useAnalyticsComputation();

  if (!analytics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-60 rounded-2xl bg-[#0f1629] border border-[#1c2d4f]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-40 rounded-2xl bg-[#0f1629] border border-[#1c2d4f]" />
          <div className="h-40 rounded-2xl bg-[#0f1629] border border-[#1c2d4f]" />
        </div>
      </div>
    );
  }

  const ba = analytics.burnoutAnalysis;
  const riskColor =
    ba.riskLevel === 'critical'
      ? '#f43f5e'
      : ba.riskLevel === 'high'
        ? '#ef4444'
        : ba.riskLevel === 'moderate'
          ? '#f59e0b'
          : '#10b981';

  const gaugeCircumference = 2 * Math.PI * 80;
  const gaugeOffset = gaugeCircumference - (ba.burnoutScore / 100) * gaugeCircumference;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#1c2d4f] bg-[#0f1629] p-6 flex flex-col lg:flex-row items-center gap-8">
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#1c2d4f"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={riskColor}
              strokeWidth="12"
              strokeDasharray={gaugeCircumference}
              strokeDashoffset={gaugeOffset}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
            <text
              x="100"
              y="95"
              textAnchor="middle"
              dominantBaseline="central"
              fill={riskColor}
              fontSize="36"
              fontWeight="700"
            >
              {ba.burnoutScore}
            </text>
            <text
              x="100"
              y="130"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#8899bb"
              fontSize="11"
              fontWeight="600"
              style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              {t(`burnout.riskLevels.${ba.riskLevel.toLowerCase()}`)}
            </text>
          </svg>
        </div>

        <div className="flex-1 w-full space-y-4">
          <h3 className="text-lg font-semibold text-[#f0f4ff]">{t('burnout.title')}</h3>
          <div className="grid grid-cols-1 gap-4">
            <FactorBar label={t('burnout.factors.lateNight')} weight="35%" score={ba.factorScores.lateNightScore} />
            <FactorBar label={t('burnout.factors.overload')} weight="30%" score={ba.factorScores.overloadScore} />
            <FactorBar label={t('burnout.factors.weekend')} weight="20%" score={ba.factorScores.weekendIntrusionScore} />
            <FactorBar label={t('burnout.factors.recovery')} weight="15%" score={ba.factorScores.recoveryDeficitScore} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1c2d4f] bg-[#0f1629] p-5">
        <h3 className="text-sm font-semibold text-[#f0f4ff] mb-4">{t('burnout.recommendations')}</h3>
        <div className="space-y-3">
          {ba.warnings.map((key, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-xl bg-[#080d1a] border border-[#1c2d4f] p-3"
            >
              <span className="mt-0.5 text-[#f59e0b] flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
              <p className="text-sm text-[#8899bb] leading-relaxed">{t(`burnout.warnings.${key}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
