import { AppsSection } from '@/components/dashboard/AppsSection';
import { BurnoutSection } from '@/components/dashboard/BurnoutSection';
import { FlowSection } from '@/components/dashboard/FlowSection';
import { FocusSection } from '@/components/dashboard/FocusSection';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { TimelineSection } from '@/components/dashboard/TimelineSection';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAppStore } from '@/store';

export default function App() {
  const currentSection = useAppStore((s) => s.currentSection);

  return (
    <DashboardLayout>
      {currentSection === 'overview' && <OverviewSection />}
      {currentSection === 'focus' && <FocusSection />}
      {currentSection === 'flow' && <FlowSection />}
      {currentSection === 'burnout' && <BurnoutSection />}
      {currentSection === 'apps' && <AppsSection />}
      {currentSection === 'timeline' && <TimelineSection />}
    </DashboardLayout>
  );
}
